import { Router } from "express";
import { Invoice } from "../models/Invoice.js";
import { Tenant } from "../models/Tenant.js";
import { Unit } from "../models/Unit.js";
import { getOrCreateCompanySettings } from "../models/CompanySettings.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";
import { logActivity } from "../models/ActivityLog.js";
import { fillInvoiceTemplatePdf } from "../services/fillInvoiceTemplate.js";

const router = Router();
router.use(requireAuth);

function monthLabel(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

async function nextInvoiceNumber(settings) {
  const prefix = (settings.invoicePrefix || "INV").replace(/[^A-Za-z0-9-]/g, "").toUpperCase() || "INV";
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const seq = settings.nextInvoiceSeq || 1;
  settings.nextInvoiceSeq = seq + 1;
  await settings.save();
  return `${prefix}-${yyyymm}-${String(seq).padStart(4, "0")}`;
}

function buildItemsForTenant(tenant, unit, options = {}) {
  const {
    includeRent = true,
    includeWater = false,
    waterUnits = 0,
    waterRate = 0,
    extraCharges = [],
  } = options;

  const items = [];

  if (includeRent) {
    const rent = Number(tenant.rentAmount) || Number(unit?.baseRent) || 0;
    if (rent > 0) {
      items.push({
        description: "Monthly Rent",
        category: "rent",
        quantity: 1,
        unitPrice: rent,
        amount: rent,
      });
    }
  }

  if (includeWater) {
    const qty = Number(waterUnits) || Number(tenant.waterUnits) || 0;
    const rate = Number(waterRate) || 0;
    const amount = qty > 0 && rate > 0 ? qty * rate : rate > 0 ? rate : 0;
    if (amount > 0) {
      items.push({
        description: qty > 0 ? `Water (${qty} units @ ${rate})` : "Water Charge",
        category: "water",
        quantity: qty > 0 ? qty : 1,
        unitPrice: qty > 0 ? rate : amount,
        amount,
      });
    }
  }

  if (unit?.charges?.length) {
    for (const charge of unit.charges) {
      if (!charge || charge.isOptional) continue;
      const amt = Number(charge.amount) || 0;
      if (amt <= 0) continue;
      items.push({
        description: charge.name || "Charge",
        category: "other",
        quantity: 1,
        unitPrice: amt,
        amount: amt,
      });
    }
  }

  for (const extra of extraCharges || []) {
    const amt = Number(extra.amount) || 0;
    if (!extra.description || amt <= 0) continue;
    items.push({
      description: extra.description,
      category: extra.category || "other",
      quantity: Number(extra.quantity) || 1,
      unitPrice: Number(extra.unitPrice) || amt,
      amount: amt,
    });
  }

  return items;
}

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.apartmentId) filter.apartmentId = req.query.apartmentId;
    if (req.query.tenantId) filter.tenantId = req.query.tenantId;
    if (req.query.status) filter.status = req.query.status;
    const rows = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json(serializeMany(rows));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const row = await Invoice.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Invoice not found" });
  res.json(serialize(row));
});

/** Download filled PDF using the uploaded draft invoice template (if set). */
router.get("/:id/filled-pdf", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    const company = await getOrCreateCompanySettings();
    if (!company.invoiceTemplateUrl) {
      return res.status(400).json({
        message:
          "No draft invoice template uploaded. Go to Settings → Company / Invoices and upload your blank invoice PDF.",
      });
    }
    const pdf = await fillInvoiceTemplatePdf(invoice, company);
    if (!pdf) {
      return res.status(400).json({
        message: "Template file missing on server. Re-upload your draft invoice PDF in Settings.",
      });
    }
    const filename = `${invoice.invoiceNumber || "invoice"}.pdf`.replace(/[^\w.-]+/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", requireRoles("admin", "manager", "accountant"), async (req, res) => {
  try {
    const {
      tenantId,
      items,
      issueDate,
      dueDate,
      periodLabel,
      notes,
      status,
      includeRent,
      includeWater,
      waterUnits,
      waterRate,
      extraCharges,
    } = req.body;

    if (!tenantId) return res.status(400).json({ message: "tenantId is required" });

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const unit = tenant.unitId
      ? await Unit.findById(tenant.unitId)
      : await Unit.findOne({ apartmentId: tenant.apartmentId, unitNumber: tenant.unit });

    const settings = await getOrCreateCompanySettings();
    const lineItems =
      Array.isArray(items) && items.length
        ? items
        : buildItemsForTenant(tenant, unit, {
            includeRent,
            includeWater,
            waterUnits,
            waterRate,
            extraCharges,
          });

    if (!lineItems.length) {
      return res.status(400).json({ message: "Invoice needs at least one line item" });
    }

    const subtotal = lineItems.reduce((s, i) => s + Number(i.amount || 0), 0);
    const invoiceNumber = await nextInvoiceNumber(settings);
    const customerId = tenant.unit;

    const invoice = await Invoice.create({
      invoiceNumber,
      customerId,
      apartmentId: tenant.apartmentId,
      tenantId: tenant._id,
      tenantName: tenant.name,
      tenantEmail: tenant.email || "",
      tenantPhone: tenant.phone || "",
      unit: tenant.unit,
      periodLabel: periodLabel || monthLabel(issueDate),
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      dueDate: dueDate || "",
      items: lineItems,
      subtotal,
      total: subtotal,
      currency: settings.currency || "KES",
      status: status || "draft",
      notes: notes || "",
      createdBy: req.user._id,
    });

    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "create_invoice",
      targetType: "payment",
      targetId: invoice._id.toString(),
      targetName: invoice.invoiceNumber,
      details: `Created invoice ${invoice.invoiceNumber} for ${tenant.name} (unit ${customerId})`,
      apartmentId: tenant.apartmentId,
    });

    res.status(201).json(serialize(invoice));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** Generate invoices for many tenants (e.g. whole apartment / all active). */
router.post("/bulk", requireRoles("admin", "manager", "accountant"), async (req, res) => {
  try {
    const {
      apartmentId,
      tenantIds,
      issueDate,
      dueDate,
      periodLabel,
      includeRent = true,
      includeWater = false,
      waterRate = 0,
      extraCharges = [],
      markSent = false,
      notes = "",
    } = req.body;

    const filter = { status: "active" };
    if (apartmentId) filter.apartmentId = apartmentId;
    if (Array.isArray(tenantIds) && tenantIds.length) filter._id = { $in: tenantIds };

    const tenants = await Tenant.find(filter);
    if (!tenants.length) {
      return res.status(400).json({ message: "No active tenants matched" });
    }

    const settings = await getOrCreateCompanySettings();
    const created = [];

    for (const tenant of tenants) {
      const unit = tenant.unitId
        ? await Unit.findById(tenant.unitId)
        : await Unit.findOne({ apartmentId: tenant.apartmentId, unitNumber: tenant.unit });

      const lineItems = buildItemsForTenant(tenant, unit, {
        includeRent,
        includeWater,
        waterUnits: tenant.waterUnits || 0,
        waterRate,
        extraCharges,
      });
      if (!lineItems.length) continue;

      const subtotal = lineItems.reduce((s, i) => s + Number(i.amount || 0), 0);
      const invoiceNumber = await nextInvoiceNumber(settings);

      const invoice = await Invoice.create({
        invoiceNumber,
        customerId: tenant.unit,
        apartmentId: tenant.apartmentId,
        tenantId: tenant._id,
        tenantName: tenant.name,
        tenantEmail: tenant.email || "",
        tenantPhone: tenant.phone || "",
        unit: tenant.unit,
        periodLabel: periodLabel || monthLabel(issueDate),
        issueDate: issueDate || new Date().toISOString().split("T")[0],
        dueDate: dueDate || "",
        items: lineItems,
        subtotal,
        total: subtotal,
        currency: settings.currency || "KES",
        status: markSent ? "sent" : "draft",
        sentAt: markSent ? new Date().toISOString() : undefined,
        notes,
        createdBy: req.user._id,
      });
      created.push(serialize(invoice));
    }

    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "bulk_create_invoices",
      targetType: "payment",
      targetName: `${created.length} invoices`,
      details: `Generated ${created.length} invoice(s)${apartmentId ? " for apartment" : ""}`,
      apartmentId: apartmentId || undefined,
    });

    res.status(201).json({ count: created.length, invoices: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", requireRoles("admin", "manager", "accountant"), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(serialize(invoice));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/send", requireRoles("admin", "manager", "accountant"), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    invoice.status = "sent";
    invoice.sentAt = new Date().toISOString();
    await invoice.save();
    res.json(serialize(invoice));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/send-bulk", requireRoles("admin", "manager", "accountant"), async (req, res) => {
  try {
    const ids = req.body.ids || [];
    if (!ids.length) return res.status(400).json({ message: "ids required" });
    const result = await Invoice.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "sent", sentAt: new Date().toISOString() } }
    );
    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", requireRoles("admin", "manager"), async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  res.json({ message: "Deleted" });
});

export default router;

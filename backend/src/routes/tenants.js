import { Router } from "express";
import bcrypt from "bcryptjs";
import { Tenant } from "../models/Tenant.js";
import { Unit } from "../models/Unit.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";
import { logActivity } from "../models/ActivityLog.js";

const router = Router();
router.use(requireAuth);

function cleanTenant(doc) {
  const t = serialize(doc);
  if (t) {
    delete t.passwordHash;
    t.hasAccount = !!doc.hasAccount;
  }
  return t;
}

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.apartmentId) filter.apartmentId = req.query.apartmentId;
  if (req.query.status) filter.status = req.query.status;
  const tenants = await Tenant.find(filter).sort({ createdAt: -1 });
  res.json(tenants.map(cleanTenant));
});

router.get("/:id", async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });
  res.json(cleanTenant(tenant));
});

router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.name || !data.email || !data.unit || data.rentAmount === undefined || !data.joiningDate) {
      return res.status(400).json({
        message: "name, email, unit, rentAmount, and joiningDate are required",
      });
    }
    if (!data.apartmentId) {
      return res.status(400).json({ message: "apartmentId is required" });
    }

    const tenant = await Tenant.create({
      ...data,
      paymentStatus: data.paymentStatus || "unpaid",
      status: data.status || "active",
      avatar: data.avatar || "",
    });

    if (data.unitId) {
      await Unit.findByIdAndUpdate(data.unitId, {
        status: "occupied",
        tenantId: tenant._id,
      });
    } else if (data.unit && data.apartmentId) {
      const unit = await Unit.findOne({ apartmentId: data.apartmentId, unitNumber: data.unit });
      if (unit) {
        unit.status = "occupied";
        unit.tenantId = tenant._id;
        await unit.save();
        tenant.unitId = unit._id;
        await tenant.save();
      }
    }

    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "create_tenant",
      targetType: "tenant",
      targetId: tenant._id.toString(),
      targetName: tenant.name,
      details: `Added tenant ${tenant.name} to ${tenant.unit}`,
      apartmentId: tenant.apartmentId,
    });

    res.status(201).json(cleanTenant(tenant));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const prevStatus = tenant.status;
    Object.assign(tenant, req.body);
    await tenant.save();

    if (req.body.status === "left" && prevStatus !== "left") {
      if (tenant.unitId) {
        await Unit.findByIdAndUpdate(tenant.unitId, { status: "vacant", tenantId: null });
      } else {
        await Unit.findOneAndUpdate(
          { apartmentId: tenant.apartmentId, unitNumber: tenant.unit },
          { status: "vacant", tenantId: null }
        );
      }
    }

    if (req.body.status === "active" && prevStatus === "left" && tenant.unitId) {
      await Unit.findByIdAndUpdate(tenant.unitId, { status: "occupied", tenantId: tenant._id });
    }

    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "update_tenant",
      targetType: "tenant",
      targetId: tenant._id.toString(),
      targetName: tenant.name,
      details: `Updated tenant ${tenant.name}`,
      apartmentId: tenant.apartmentId,
    });

    res.json(cleanTenant(tenant));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/account", async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }
    tenant.hasAccount = true;
    tenant.username = username;
    tenant.passwordHash = await bcrypt.hash(password, 10);
    tenant.accountStatus = "pending";
    await tenant.save();
    res.json({
      ...cleanTenant(tenant),
      tempCredentials: { username, password },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const tenant = await Tenant.findByIdAndDelete(req.params.id);
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });
  if (tenant.unitId) {
    await Unit.findByIdAndUpdate(tenant.unitId, { status: "vacant", tenantId: null });
  }
  res.json({ message: "Tenant deleted" });
});

export default router;

import { Router } from "express";
import { Payment } from "../models/Payment.js";
import { Tenant } from "../models/Tenant.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";
import { logActivity } from "../models/ActivityLog.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.apartmentId) filter.apartmentId = req.query.apartmentId;
  if (req.query.tenantId) filter.tenantId = req.query.tenantId;
  const payments = await Payment.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(serializeMany(payments));
});

router.post("/", async (req, res) => {
  try {
    const { tenantId, tenantName, unit, amount, date, method, status, transactionId, notes, apartmentId, allocations } =
      req.body;
    if (!tenantId || amount === undefined || !date) {
      return res.status(400).json({ message: "tenantId, amount, and date are required" });
    }
    const tenant = await Tenant.findById(tenantId);
    const payment = await Payment.create({
      apartmentId: apartmentId || tenant?.apartmentId,
      tenantId,
      tenantName: tenantName || tenant?.name || "",
      unit: unit || tenant?.unit || "",
      amount,
      date,
      method: method || "cash",
      status: status || "claimed",
      transactionId,
      notes,
      allocations: allocations || [],
      recordedBy: req.user._id,
    });

    if (tenant) {
      const rent = tenant.rentAmount || 0;
      if (amount >= rent) tenant.paymentStatus = "paid";
      else if (amount > 0) tenant.paymentStatus = "partial";
      await tenant.save();
    }

    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "record_payment",
      targetType: "payment",
      targetId: payment._id.toString(),
      targetName: payment.tenantName,
      details: `Recorded ${method || "cash"} payment of ${amount} for ${payment.unit}`,
      apartmentId: payment.apartmentId,
    });

    res.status(201).json(serialize(payment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(serialize(payment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  res.json({ message: "Payment deleted" });
});

export default router;

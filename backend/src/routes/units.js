import { Router } from "express";
import { Unit } from "../models/Unit.js";
import { Apartment } from "../models/Apartment.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";
import { logActivity } from "../models/ActivityLog.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.apartmentId) filter.apartmentId = req.query.apartmentId;
  if (req.query.status) filter.status = req.query.status;
  const units = await Unit.find(filter).sort({ unitNumber: 1 });
  res.json(serializeMany(units));
});

router.post("/", async (req, res) => {
  try {
    const { apartmentId, unitNumber, unitType, baseRent, charges, status, floor, squareFeet, tenantId } =
      req.body;
    if (!apartmentId || !unitNumber || !unitType || baseRent === undefined) {
      return res.status(400).json({ message: "apartmentId, unitNumber, unitType, baseRent required" });
    }
    const unit = await Unit.create({
      apartmentId,
      unitNumber,
      unitType,
      baseRent,
      charges: charges || [],
      status: status || "vacant",
      floor,
      squareFeet,
      tenantId: tenantId || null,
    });
    await Apartment.findByIdAndUpdate(apartmentId, { hasUnitsConfigured: true });
    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "create_unit",
      targetType: "unit",
      targetId: unit._id.toString(),
      targetName: unit.unitNumber,
      details: `Created ${unit.unitNumber}`,
      apartmentId,
    });
    res.status(201).json(serialize(unit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json(serialize(unit));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const unit = await Unit.findByIdAndDelete(req.params.id);
  if (!unit) return res.status(404).json({ message: "Unit not found" });
  res.json({ message: "Unit deleted" });
});

export default router;

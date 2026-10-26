import { Router } from "express";
import { Apartment } from "../models/Apartment.js";
import { Unit } from "../models/Unit.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";
import { logActivity } from "../models/ActivityLog.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const apartments = await Apartment.find().sort({ createdAt: -1 });
  res.json(serializeMany(apartments));
});

router.get("/:id", async (req, res) => {
  const apartment = await Apartment.findById(req.params.id);
  if (!apartment) return res.status(404).json({ message: "Apartment not found" });
  res.json(serialize(apartment));
});

router.post("/", async (req, res) => {
  try {
    const { name, description, imageUrl, address, hasUnitsConfigured, status } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const apartment = await Apartment.create({
      name,
      description: description || "",
      imageUrl: imageUrl || "",
      address: address || "",
      hasUnitsConfigured: !!hasUnitsConfigured,
      status: status || "active",
      createdBy: req.user._id,
    });
    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "create_apartment",
      targetType: "apartment",
      targetId: apartment._id.toString(),
      targetName: apartment.name,
      details: `Added property ${apartment.name}`,
      apartmentId: apartment._id,
    });
    res.status(201).json(serialize(apartment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!apartment) return res.status(404).json({ message: "Apartment not found" });
    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "update_apartment",
      targetType: "apartment",
      targetId: apartment._id.toString(),
      targetName: apartment.name,
      details: `Updated property ${apartment.name}`,
      apartmentId: apartment._id,
    });
    res.json(serialize(apartment));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const apartment = await Apartment.findByIdAndDelete(req.params.id);
  if (!apartment) return res.status(404).json({ message: "Apartment not found" });
  await Unit.deleteMany({ apartmentId: apartment._id });
  await logActivity({
    userId: req.user.id,
    userName: req.user.name,
    action: "delete_apartment",
    targetType: "apartment",
    targetId: apartment._id.toString(),
    targetName: apartment.name,
    details: `Deleted property ${apartment.name}`,
  });
  res.json({ message: "Apartment deleted" });
});

export default router;

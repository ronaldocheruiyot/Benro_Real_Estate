import { Router } from "express";
import { Inspection } from "../models/Inspection.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.apartmentId) filter.apartmentId = req.query.apartmentId;
  const items = await Inspection.find(filter).sort({ scheduledDate: -1 });
  res.json(serializeMany(items));
});

router.post("/", async (req, res) => {
  try {
    const item = await Inspection.create({
      ...req.body,
      conductedBy: req.user._id,
    });
    res.status(201).json(serialize(item));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const item = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Inspection not found" });
  res.json(serialize(item));
});

router.delete("/:id", async (req, res) => {
  const item = await Inspection.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Inspection not found" });
  res.json({ message: "Deleted" });
});

export default router;

import { Router } from "express";
import { Advertisement } from "../models/Advertisement.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const items = await Advertisement.find().sort({ createdAt: -1 });
  res.json(serializeMany(items));
});

router.post("/", async (req, res) => {
  try {
    const item = await Advertisement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(serialize(item));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await Advertisement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Advertisement not found" });
    res.json(serialize(item));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const item = await Advertisement.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Advertisement not found" });
  res.json({ message: "Deleted" });
});

export default router;

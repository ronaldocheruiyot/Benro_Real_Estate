import { Router } from "express";
import { Land } from "../models/Land.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const items = await Land.find().sort({ createdAt: -1 });
  res.json(serializeMany(items));
});

router.post("/", async (req, res) => {
  try {
    const item = await Land.create(req.body);
    res.status(201).json(serialize(item));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const item = await Land.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Land not found" });
  res.json(serialize(item));
});

router.delete("/:id", async (req, res) => {
  const item = await Land.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Land not found" });
  res.json({ message: "Deleted" });
});

export default router;

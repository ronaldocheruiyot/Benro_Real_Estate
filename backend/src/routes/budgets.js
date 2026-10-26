import { Router } from "express";
import { Budget } from "../models/Budget.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const items = await Budget.find().sort({ createdAt: -1 });
  res.json(serializeMany(items));
});

router.post("/", async (req, res) => {
  try {
    const item = await Budget.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(serialize(item));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const updates = { ...req.body };
  if (updates.status === "approved") updates.approvedBy = req.user._id;
  const item = await Budget.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!item) return res.status(404).json({ message: "Budget not found" });
  res.json(serialize(item));
});

router.delete("/:id", async (req, res) => {
  const item = await Budget.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Budget not found" });
  res.json({ message: "Deleted" });
});

export default router;

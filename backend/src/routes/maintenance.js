import { Router } from "express";
import { MaintenanceTask } from "../models/MaintenanceTask.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.apartmentId) filter.apartmentId = req.query.apartmentId;
  if (req.query.status) filter.status = req.query.status;
  const tasks = await MaintenanceTask.find(filter).sort({ createdAt: -1 });
  res.json(serializeMany(tasks));
});

router.post("/", async (req, res) => {
  try {
    const task = await MaintenanceTask.create({
      ...req.body,
      reportedBy: req.user._id,
    });
    res.status(201).json(serialize(task));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const task = await MaintenanceTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(serialize(task));
});

router.delete("/:id", async (req, res) => {
  const task = await MaintenanceTask.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Deleted" });
});

export default router;

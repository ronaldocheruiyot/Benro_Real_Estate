import { Router } from "express";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const items = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(serializeMany(items));
});

router.post("/", async (req, res) => {
  const item = await Notification.create(req.body);
  res.status(201).json(serialize(item));
});

router.put("/:id/read", async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(serialize(item));
});

router.put("/read-all", async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ message: "All marked read" });
});

export default router;

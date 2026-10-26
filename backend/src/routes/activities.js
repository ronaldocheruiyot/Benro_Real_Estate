import { Router } from "express";
import { ActivityLog } from "../models/ActivityLog.js";
import { requireAuth } from "../middleware/auth.js";
import { serializeMany } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.apartmentId) filter.apartmentId = req.query.apartmentId;
  const logs = await ActivityLog.find(filter).sort({ timestamp: -1 }).limit(500);
  res.json(serializeMany(logs));
});

router.post("/", async (req, res) => {
  const log = await ActivityLog.create({
    ...req.body,
    userId: req.body.userId || req.user.id,
    userName: req.body.userName || req.user.name,
    timestamp: req.body.timestamp || new Date().toISOString(),
  });
  res.status(201).json(serializeMany([log])[0]);
});

export default router;

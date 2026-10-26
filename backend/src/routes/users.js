import { Router } from "express";
import { User, defaultPermissionsByRole } from "../models/User.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { serialize, serializeMany } from "../utils/serialize.js";
import { logActivity } from "../models/ActivityLog.js";

const router = Router();

router.use(requireAuth);

router.get("/", requireRoles("admin", "manager"), async (_req, res) => {
  const users = await User.find().sort({ createdDate: -1 });
  res.json(serializeMany(users).map((u) => ({
    ...u,
    createdDate: u.createdDate ? new Date(u.createdDate).toISOString().split("T")[0] : undefined,
  })));
});

router.post("/", requireRoles("admin"), async (req, res) => {
  try {
    const { name, email, password, role, permissions, assignedProperties, status } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, and role are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({
      name,
      email,
      password,
      role,
      status: status || "active",
      tempPassword: true,
      permissions: permissions || defaultPermissionsByRole[role],
      assignedProperties: assignedProperties || [],
    });

    await logActivity({
      userId: req.user.id,
      userName: req.user.name,
      action: "create_user",
      targetType: "user",
      targetId: user._id.toString(),
      targetName: user.name,
      details: `Created ${role} account for ${email}`,
    });

    res.status(201).json(serialize(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", requireRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, role, status, permissions, assignedProperties, password, tempPassword } =
      req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (permissions !== undefined) user.permissions = permissions;
    if (assignedProperties !== undefined) user.assignedProperties = assignedProperties;
    if (tempPassword !== undefined) user.tempPassword = tempPassword;
    if (password) user.password = password;

    await user.save();
    res.json(serialize(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", requireRoles("admin"), async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "Cannot delete your own account" });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
});

export default router;

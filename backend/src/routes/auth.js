import { Router } from "express";
import { User, defaultPermissionsByRole } from "../models/User.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { serialize } from "../utils/serialize.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.status !== "active") {
      return res.status(403).json({ message: `Account is ${user.status}` });
    }
    user.lastLogin = new Date().toISOString().split("T")[0];
    await user.save();
    const token = signToken(user);
    const safe = serialize(user);
    safe.createdDate = user.createdDate
      ? new Date(user.createdDate).toISOString().split("T")[0]
      : safe.createdDate;
    return res.json({ token, user: safe });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const safe = serialize(req.user);
  safe.createdDate = req.user.createdDate
    ? new Date(req.user.createdDate).toISOString().split("T")[0]
    : undefined;
  res.json({ user: safe });
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, phone, address, avatar } = req.body;

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return res.status(400).json({ message: "Name is required" });
      user.name = trimmed;
    }

    if (email !== undefined) {
      const nextEmail = String(email).toLowerCase().trim();
      if (!nextEmail) return res.status(400).json({ message: "Email is required" });
      const taken = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ message: "Email already in use" });
      user.email = nextEmail;
    }

    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();
    if (avatar !== undefined) user.avatar = String(avatar);

    await user.save();

    const safe = serialize(user);
    safe.createdDate = user.createdDate
      ? new Date(user.createdDate).toISOString().split("T")[0]
      : undefined;
    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword || ""))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    user.password = newPassword;
    user.tempPassword = false;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/permissions-defaults", requireAuth, (_req, res) => {
  res.json(defaultPermissionsByRole);
});

export default router;

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.use(requireAuth);

router.post("/:category", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const category = req.params.category.replace(/[^a-z]/gi, "") || "documents";
  const url = `/uploads/${category}/${req.file.filename}`;
  res.status(201).json({
    url,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
});

export default router;

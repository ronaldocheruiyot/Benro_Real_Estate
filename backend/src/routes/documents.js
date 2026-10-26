import { Router } from "express";
import { Document } from "../models/Document.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { serialize, serializeMany } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.apartmentId) filter.apartmentId = req.query.apartmentId;
  if (req.query.tenantId) filter.tenantId = req.query.tenantId;
  const docs = await Document.find(filter).sort({ createdAt: -1 });
  res.json(serializeMany(docs));
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { name, category, apartmentId, tenantId, notes, status } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    let fileUrl = req.body.fileUrl || "";
    let fileName = req.body.fileName || "";
    let mimeType = req.body.mimeType || "";
    let size = Number(req.body.size || 0);

    if (req.file) {
      fileUrl = `/uploads/documents/${req.file.filename}`;
      // multer destination may use category param
      const folder = req.file.destination.split(/[/\\]/).pop();
      fileUrl = `/uploads/${folder}/${req.file.filename}`;
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;
      size = req.file.size;
    }

    if (!fileUrl) return res.status(400).json({ message: "file or fileUrl is required" });

    const doc = await Document.create({
      name,
      category: category || "other",
      fileUrl,
      fileName,
      mimeType,
      size,
      apartmentId: apartmentId || undefined,
      tenantId: tenantId || undefined,
      notes: notes || "",
      status: status || "pending",
      uploadedBy: req.user._id,
    });
    res.status(201).json(serialize(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json(serialize(doc));
});

router.delete("/:id", async (req, res) => {
  const doc = await Document.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json({ message: "Deleted" });
});

export default router;

import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, "../../", process.env.UPLOAD_DIR || "uploads");

for (const folder of ["avatars", "properties", "documents", "maintenance", "inspections", "adverts"]) {
  fs.mkdirSync(path.join(uploadRoot, folder), { recursive: true });
}

const DOC_CATEGORIES = new Set(["lease", "ownership", "permit", "id", "other"]);

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    // Route param / uploadFolder wins. Document categories (id, lease, …) always land in documents/.
    const raw = req.params.category || req.body.uploadFolder || req.body.category || "documents";
    let folder = String(raw).replace(/[^a-z]/gi, "") || "documents";
    if (DOC_CATEGORIES.has(folder)) folder = "documents";
    const dest = path.join(uploadRoot, folder);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename(_req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = /jpeg|jpg|png|gif|webp|bmp|heic|pdf|doc|docx|xls|xlsx|txt/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (allowed.test(ext) || allowed.test(file.mimetype) || String(file.mimetype || "").startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Use images (JPG, PNG, WEBP, GIF) or documents (PDF, DOC)."));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

export { uploadRoot };

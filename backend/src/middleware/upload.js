import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, "../../", process.env.UPLOAD_DIR || "uploads");

for (const folder of ["avatars", "properties", "documents", "maintenance", "inspections", "adverts"]) {
  fs.mkdirSync(path.join(uploadRoot, folder), { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const category = (req.params.category || req.body.category || "documents").replace(/[^a-z]/gi, "");
    const dest = path.join(uploadRoot, category);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename(_req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (allowed.test(ext) || allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

export { uploadRoot };

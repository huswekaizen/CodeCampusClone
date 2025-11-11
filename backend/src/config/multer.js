import multer from "multer";
import path from "path";
import fs from "fs";

// make sure uploads folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    const unique = `${Date.now()}-${base}${ext}`;
    cb(null, unique);
  }
});

// simple file filter for images
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetypeOk = allowed.test(file.mimetype);
  const extOk = allowed.test(ext);
  if (mimetypeOk && extOk) return cb(null, true);
  cb(new Error("Unsupported file type. Use jpeg/png/webp/gif."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3 MB
});

export default upload;

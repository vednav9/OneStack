import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.resolve(process.cwd(), "uploads", "avatars");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `${req.user.userId}-${Date.now()}${safeExt}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"), false);
  }
  return cb(null, true);
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

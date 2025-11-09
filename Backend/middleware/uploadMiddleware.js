import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Ensure upload directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// ✅ File filter: images & video allowed
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

// ✅ Multer config
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter,
});

// ✅ Fields for accommodation form
// Accept common variants of field names to avoid LIMIT_UNEXPECTED_FILE when
// client uses slightly different names (e.g. `image` vs `images`, `video` vs `videos`).
// Expect only the fields we actually use in the listing forms to make
// unexpected-field errors easier to reproduce and debug.
export const uploadListingMedia = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "videos", maxCount: 2 },
]);

export default upload;

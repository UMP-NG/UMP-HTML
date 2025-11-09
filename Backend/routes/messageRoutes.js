import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  sendMessage,
  getUserMessages,
  markMessageRead,
  getUserConversations,
  getUserConversationsLatest,
  markConversationRead,
  getUnreadCounts,
  getMessageById,
  getUnreadMessages,
} from "../controllers/messageController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------- 🔹 Ensure upload folder exists ----------
const uploadDir = "uploads/messages";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------- 🔹 File Upload Setup ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type"));
  },
});

// ---------- 🔹 Define all allowed roles ----------
const ALL_CHAT_ROLES = [
  "user",
  "seller",
  "walker",
  "service_provider",
  "admin",
];

// ---------- 🔹 Routes ----------
router.post(
  "/send",
  protect,
  requireRole(...ALL_CHAT_ROLES),
  upload.array("attachments", 5),
  sendMessage
);

router.get("/user", protect, requireRole(...ALL_CHAT_ROLES), getUserMessages);
router.get(
  "/conversations",
  protect,
  requireRole(...ALL_CHAT_ROLES),
  getUserConversations
);
router.get(
  "/latest",
  protect,
  requireRole(...ALL_CHAT_ROLES),
  getUserConversationsLatest
);
router.get(
  "/unread-counts",
  protect,
  requireRole(...ALL_CHAT_ROLES),
  getUnreadCounts
);
router.get(
  "/unread/:userId",
  protect,
  requireRole(...ALL_CHAT_ROLES),
  getUnreadMessages
);
router.get(
  "/:messageId",
  protect,
  requireRole(...ALL_CHAT_ROLES),
  getMessageById
);
router.put(
  "/:messageId/read",
  protect,
  requireRole(...ALL_CHAT_ROLES),
  markMessageRead
);
router.put(
  "/conversation/:conversationWithId/read",
  protect,
  requireRole(...ALL_CHAT_ROLES),
  markConversationRead
);

export default router;

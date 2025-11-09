import express from "express";
import multer from "multer";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  getSellerDashboard,
  updateSellerSettings,
  updateNotificationPreferences,
  updateSellerPolicies,
  updatePassword,
  deactivateAccount,
} from "../controllers/sellerAnalyticsController.js";
import { getSellerOrders } from "../controllers/orderController.js";

const router = express.Router();

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage });

// ✅ Routes
router.put(
  "/sellers/settings",
  protect,
  requireRole("seller"),
  upload.single("logo"),
  updateSellerSettings
);
router.put(
  "/notifications/preferences",
  protect,
  requireRole("seller"),
  updateNotificationPreferences
);
router.put(
  "/sellers/policies",
  protect,
  requireRole("seller"),
  updateSellerPolicies
);
router.put("/users/update-password", protect, updatePassword);
router.delete("/users/deactivate", protect, deactivateAccount);
router.get("/", protect, requireRole("seller"), getSellerDashboard);
router.get("/orders", protect, requireRole("seller"), getSellerOrders);
export default router;

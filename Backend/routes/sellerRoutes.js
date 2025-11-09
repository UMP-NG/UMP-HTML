import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  becomeSeller,
  getAllSellers,
  getSellerById,
  followSeller,
  unfollowSeller,
  incrementSellerView,
  getSellerProfile,
} from "../controllers/sellerController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads", "sellers");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/me", protect, getSellerProfile);

// ✅ Create or update seller profile (only seller or admin)
router.post(
  "/profile",
  protect,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  requireRole("seller", "admin"),
  becomeSeller
);

// ✅ List all sellers (public)
router.get("/", getAllSellers);

// ✅ Follow a seller (any authenticated user)
router.post(
  "/:id/follow",
  protect,
  requireRole("user", "seller", "admin"),
  followSeller
);

// ✅ Unfollow a seller (any authenticated user)
router.post(
  "/:id/unfollow",
  protect,
  requireRole("user", "seller", "admin"),
  unfollowSeller
);

router.patch("/:id/view", incrementSellerView);

// ✅ Get seller info by ID (public)
router.get("/:id", getSellerById);

export default router;

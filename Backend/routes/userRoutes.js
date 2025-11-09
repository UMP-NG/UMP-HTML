import express from "express";
import {
  getCurrentUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  getUserById,
  followUser,
  unfollowUser,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  updateCartItem,
  removeFromCart,
  markNotificationRead,
  becomeServiceProvider,
  updateWalkerProfile,
} from "../controllers/userController.js";
import { becomeSeller } from "../controllers/sellerController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ===============================
// Current logged-in user routes
// ===============================
router.get("/me", protect, getCurrentUserProfile); // Get own profile
router.put("/me", protect, updateUserProfile); // Update own profile
router.delete("/me", protect, deleteUser); // Delete own account

// Wishlist
router.post("/me/wishlist/:productId", protect, addToWishlist);
router.delete("/me/wishlist/:productId", protect, removeFromWishlist);

// Cart
router.post("/me/cart/:productId", protect, addToCart);
router.put("/me/cart/:productId", protect, updateCartItem); // e.g., change quantity
router.delete("/me/cart/:productId", protect, removeFromCart);

// Follow/Unfollow users
router.post("/me/follow/:userId", protect, followUser);
router.post("/me/unfollow/:userId", protect, unfollowUser);

// Notifications
router.put(
  "/me/notifications/:notificationId/read",
  protect,
  markNotificationRead
);

router.post(
  "/become/seller",
  protect,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  becomeSeller
);

router.post(
  "/become/service_provider",
  protect,
  upload.single("image"),
  becomeServiceProvider
);

// ===============================
// Admin-only routes
// ===============================
router.get("/", protect, requireRole("admin"), getAllUsers);
router.get("/:id", protect, requireRole("admin"), getUserById);
router.patch(
  "/:id/updateWalkerProfile",
  protect,
  upload.single("avatar"),
  updateWalkerProfile
);

export default router;

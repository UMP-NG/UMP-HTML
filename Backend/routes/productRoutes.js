// productRoutes.js
import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAdvertisedProducts,
  filterAndSortProducts,
  getRelatedProducts,
  getMyProducts,
  trackProductView,
} from "../controllers/productController.js";
import { uploadListingMedia } from "../middleware/uploadMiddleware.js"; // ✅ Use single config

const router = express.Router();

// ------------------------------
// 🌍 Public Routes
// ------------------------------
router.post(
  "/",
  protect,
  requireRole("seller", "admin"),
  uploadListingMedia,
  createProduct
);
router.get("/advertised", getAdvertisedProducts);
router.get("/filter", filterAndSortProducts);
router.get("/", getAllProducts);
router.get("/:id/related", getRelatedProducts);

// ------------------------------
// 🛒 Seller-only Routes
// ------------------------------
router.get("/my", protect, requireRole("seller"), getMyProducts);

router.put(
  "/:id",
  protect,
  requireRole("seller", "admin"),
  uploadListingMedia,
  updateProduct
);

router.post("/:id/view", trackProductView);

router.delete("/:id", protect, requireRole("seller", "admin"), deleteProduct);

// Variant APIs removed (stock/variant endpoints)

// 🧩 Dynamic route (keep last)
router.get("/:id", getProductById);

export default router;

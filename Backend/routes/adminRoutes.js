import express from "express";
import multer from "multer";
import Admin from "../models/Admin.js";
import { bulkImportProducts } from "../controllers/adminController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllSellers,
  updateSellerStatus,
  deleteSeller,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllListings,
  updateListing,
  deleteListing,
  getAllServices,
  updateService,
  deleteService,
  getAllOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/adminController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", protect, async (req, res) => {
  try {
    const admins = await Admin.find({ isActive: true }).select(
      "_id name email avatar"
    );
    if (!admins.length)
      return res.status(404).json({ message: "No admins found" });
    res.json(admins);
  } catch (err) {
    console.error("❌ Error fetching admins:", err);
    res.status(500).json({ message: "Server error fetching admins" });
  }
});

// ===============================
// Users
// ===============================
router.get("/users", protect, requireRole("admin"), getAllUsers);
router.put(
  "/users/:userId/role",
  protect,
  requireRole("admin"),
  updateUserRole
);
router.delete("/users/:userId", protect, requireRole("admin"), deleteUser);

// ===============================
// Sellers
// ===============================
router.get("/sellers", protect, requireRole("admin"), getAllSellers);
router.put(
  "/sellers/:sellerId/status",
  protect,
  requireRole("admin"),
  updateSellerStatus
);
router.delete(
  "/sellers/:sellerId",
  protect,
  requireRole("admin"),
  deleteSeller
);

// ===============================
// Products
// ===============================
router.get("/products", protect, requireRole("admin"), getAllProducts);
router.put(
  "/products/:productId",
  protect,
  requireRole("admin"),
  updateProduct
);
router.delete(
  "/products/:productId",
  protect,
  requireRole("admin"),
  deleteProduct
);

// ===============================
// Listings
// ===============================
router.get("/listings", protect, requireRole("admin"), getAllListings);
router.put(
  "/listings/:listingId",
  protect,
  requireRole("admin"),
  updateListing
);
router.delete(
  "/listings/:listingId",
  protect,
  requireRole("admin"),
  deleteListing
);

// ===============================
// Services
// ===============================
router.get("/services", protect, requireRole("admin"), getAllServices);
router.put(
  "/services/:serviceId",
  protect,
  requireRole("admin"),
  updateService
);
router.delete(
  "/services/:serviceId",
  protect,
  requireRole("admin"),
  deleteService
);

// ===============================
// Orders
// ===============================
router.get("/orders", protect, requireRole("admin"), getAllOrders);
router.put("/orders/:orderId", protect, requireRole("admin"), updateOrder);
router.delete("/orders/:orderId", protect, requireRole("admin"), deleteOrder);

router.post(
  "/import-products",
  protect,
  requireRole("admin"),
  upload.single("file"),
  bulkImportProducts
);

export default router;

import Order from "../models/Order.js";
import express from "express";
import { protect as verifyToken } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  downloadInvoice,
  getIncomingOrders,
  checkoutCart,
  confirmDelivery,
  confirmTransfer,
  getEscrowDetails,
} from "../controllers/orderController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create order (user, seller, walker, admin)
router.post(
  "/",
  protect,
  requireRole("user", "seller", "walker", "admin"),
  createOrder
);


router.get("/escrow-details", protect, getEscrowDetails);

// In your orderRoutes.js
router.get(
  "/current",
  protect,
  requireRole("user", "seller", "walker", "admin"),
  async (req, res) => {
    const order = await Order.findOne({
      buyer: req.user._id,
      status: "pending",
    });
    if (!order) return res.status(404).json({ message: "No active order" });
    res.json(order);
  }
);

router.post(
  "/transfer",
  protect,
  upload.single("paymentProof"),
  confirmTransfer
);

// ✅ Walker/Seller incoming orders
router.get(
  "/incoming",
  protect,
  requireRole("walker", "seller", "admin"),
  getIncomingOrders
);

// ✅ Create order (checkout)
router.post(
  "/checkout",
  protect,
  requireRole("user", "seller", "walker", "admin"),
  verifyToken,
  checkoutCart
);

// ✅ Fetch user orders
router.get(
  "/my-orders",
  protect,
  requireRole("user", "seller", "walker", "admin"),
  verifyToken,
  getMyOrders
);

// ✅ Confirm delivery (release escrow)
router.put(
  "/:orderId/confirm-delivery",
  protect,
  requireRole("user", "seller", "walker", "admin"),
  verifyToken,
  confirmDelivery
);

// ✅ Get single order by ID (buyer, seller, walker, admin)
router.get(
  "/:id",
  protect,
  requireRole("user", "seller", "walker", "admin"),
  getOrderById
);

// ✅ Update order (admin, seller, walker)
router.put(
  "/:id",
  protect,
  requireRole("admin", "seller", "walker"),
  updateOrder
);

// ✅ Update order status (user, seller, walker, admin)
router.put(
  "/:id/status",
  protect,
  requireRole("user", "seller", "walker", "admin"),
  updateOrderStatus
);

// ✅ Download invoice (user, seller, walker, admin)
router.get(
  "/:id/invoice",
  protect,
  requireRole("user", "seller", "walker", "admin"),
  downloadInvoice
);

// ✅ Cancel order (user, walker, admin)
router.delete(
  "/:id",
  protect,
  requireRole("user", "walker", "admin"),
  cancelOrder
);

export default router;

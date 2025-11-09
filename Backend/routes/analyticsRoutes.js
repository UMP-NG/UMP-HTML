import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// Seller analytics
router.get("/seller/analytics", protect, requireRole("seller"), (req, res) => {
  res.json({ message: "Welcome Seller Analytics", user: req.user.name });
});

// Service Provider analytics
router.get(
  "/services/analytics",
  protect,
  requireRole("service_provider"),
  (req, res) => {
    res.json({ message: "Service Provider Analytics" });
  }
);

// Walker analytics
router.get("/walker/analytics", protect, requireRole("walker"), (req, res) => {
  res.json({ message: "Walker Analytics" });
});

export default router;

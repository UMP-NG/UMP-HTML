// routes/bookingRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getUserBookings,
  getProviderBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

// 🧭 User creates booking (for service or listing)
router.post("/", protect, createBooking);

// 🧭 User views their own bookings
router.get("/me", protect, getUserBookings);

// 🧭 Provider (seller or service_provider) views bookings they received
router.get("/provider", protect, getProviderBookings);

export default router;

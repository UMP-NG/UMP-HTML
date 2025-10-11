import express from "express";
import {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyOTP,
  logout,
  resendOtp,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// AUTH ROUTES
// ==========================
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);

// Protected routes
router.get("/me", protect, getMe);
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

router.put("/me", protect, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/verify-otp", verifyOTP);
router.post("/auth/resend-otp", resendOtp);

export default router;

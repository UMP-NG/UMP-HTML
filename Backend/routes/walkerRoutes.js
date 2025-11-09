import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { updateWalkerProfile } from "../controllers/userController.js";
import {
  applyDispatcher,
  getMyDispatcherProfile,
  getPendingDispatchers,
  updateDispatcherStatus,
} from "../controllers/walkerController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student
router.post("/apply", protect, upload.single("idCard"), applyDispatcher);
router.get("/me", protect, getMyDispatcherProfile);

// Admin
router.get("/pending", protect, requireRole("admin"), getPendingDispatchers);
router.put(
  "/:id/status",
  protect,
  requireRole("admin"),
  updateDispatcherStatus
);
router.patch("/:id/updateWalkerProfile", protect, updateWalkerProfile);

export default router;

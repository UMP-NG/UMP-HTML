import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
} from "../controllers/serviceController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
// list my services (protected)
router.get("/mine", protect, getMyServices);

router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Protected (service_provider + admin)
router.post(
  "/",
  protect,
  requireRole("service_provider", "admin"),
  upload.single("image"),
  createService
);
router.put(
  "/:id",
  protect,
  requireRole("service_provider", "admin"),
  upload.single("image"),
  updateService
);
router.delete(
  "/:id",
  protect,
  requireRole("service_provider", "admin"),
  deleteService
);

export default router;

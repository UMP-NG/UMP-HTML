import express from "express";
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { uploadListingMedia } from "../middleware/uploadMiddleware.js"; // ✅ import correctly

const router = express.Router();

router.post(
  "/",
  protect,
  requireRole("seller", "admin"),
  uploadListingMedia,
  createListing
);
router.put(
  "/:id",
  protect,
  requireRole("seller", "admin"),
  uploadListingMedia,
  updateListing
);

router.get("/", getAllListings);
router.get("/:id", getListingById);
router.delete("/:id", protect, requireRole("seller", "admin"), deleteListing);

export default router;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  initializePayment,
  verifyPayment,
  confirmTransfer,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initialize", protect, initializePayment);
router.get("/verify", protect, verifyPayment);
router.post("/confirm", protect, confirmTransfer);

export default router;

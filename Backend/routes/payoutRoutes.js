import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  requestPayout,
  getPayoutsForSeller,
  getPayoutSummary,
  getPayoutDetails,
  updatePayoutDetails,
} from "../controllers/payoutController.js";

const router = express.Router();

router.post("/request", protect, requestPayout);
router.get("/", protect, getPayoutsForSeller);
router.get("/summary", protect, getPayoutSummary);
router.get("/details", protect, getPayoutDetails);
router.put("/details", protect, updatePayoutDetails);


export default router;

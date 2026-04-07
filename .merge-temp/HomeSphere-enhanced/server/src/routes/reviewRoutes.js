import express from "express";
import { createReview, getReviewsByProvider } from "../controllers/reviewController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/provider/:providerId", getReviewsByProvider);
router.post("/", protect, authorize("user", "admin"), createReview);

export default router;

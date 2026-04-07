import express from "express";
import {
  createBooking,
  getBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getBookings).post(protect, authorize("user", "admin"), createBooking);
router.put("/:id/status", protect, authorize("provider", "admin"), updateBookingStatus);

export default router;

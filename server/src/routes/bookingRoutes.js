import express from "express";
import {
  cancelBooking,
  createBooking,
  getBookings,
  processMockPayment,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getBookings).post(protect, authorize("user", "admin"), createBooking);
router.put("/:id/cancel", protect, cancelBooking);
router.put("/:id/pay", protect, authorize("user", "admin"), processMockPayment);
router.put("/:id/status", protect, authorize("provider", "admin"), updateBookingStatus);

export default router;

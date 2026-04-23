import express from "express";
import {
  createMessage,
  getMessagesByBooking,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/booking/:bookingId", protect, getMessagesByBooking);
router.post("/", protect, createMessage);

export default router;

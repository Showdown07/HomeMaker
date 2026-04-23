import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import { createNotification } from "../services/notificationService.js";

const getBookingForParticipant = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId).populate("service", "name");
  if (!booking) return null;

  const isParticipant =
    booking.user.toString() === user._id.toString() ||
    booking.provider.toString() === user._id.toString() ||
    user.role === "admin";

  return isParticipant ? booking : null;
};

export const getMessagesByBooking = asyncHandler(async (req, res) => {
  const booking = await getBookingForParticipant(req.params.bookingId, req.user);
  if (!booking) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Booking conversation not found");
  }

  const messages = await Message.find({ booking: booking._id })
    .populate("sender", "name role")
    .sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
});

export const createMessage = asyncHandler(async (req, res) => {
  if (!req.body.body?.trim()) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Message cannot be empty");
  }

  const booking = await getBookingForParticipant(req.body.bookingId, req.user);
  if (!booking) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Booking conversation not found");
  }

  const recipient =
    booking.user.toString() === req.user._id.toString() ? booking.provider : booking.user;

  const message = await Message.create({
    booking: booking._id,
    sender: req.user._id,
    recipient,
    body: req.body.body.trim(),
  });

  await createNotification({
    recipient,
    title: "New booking message",
    message: `${req.user.name} sent a message about ${booking.service?.name || "your booking"}`,
    type: "message",
    meta: { bookingId: booking._id, messageId: message._id },
  });

  const populated = await message.populate("sender", "name role");
  res.status(StatusCodes.CREATED).json({ success: true, data: populated });
});

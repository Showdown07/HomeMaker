import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { isProviderAvailable } from "../services/availabilityService.js";
import { createNotification } from "../services/notificationService.js";
import {
  isIsoDate,
  isTimeSlot,
  requireFields,
} from "../utils/validators.js";

const ALLOWED_BOOKING_STATUSES = new Set([
  "pending",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
]);

const mockTransactionId = () => `pay_${Date.now()}`;

export const createBooking = asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, [
    "serviceId",
    "bookingDate",
    "slotStart",
    "slotEnd",
    "address",
  ]);
  if (missing.length) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  if (!isIsoDate(req.body.bookingDate)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Please provide a valid booking date");
  }

  if (!isTimeSlot(req.body.slotStart) || !isTimeSlot(req.body.slotEnd)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Slot times must use HH:MM format");
  }

  if (req.body.slotStart >= req.body.slotEnd) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Slot end time must be after start time");
  }

  const service = await Service.findById(req.body.serviceId).populate("provider");
  if (!service) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Service not found");
  }

  const provider = await User.findById(service.provider._id);
  const available = await isProviderAvailable({
    provider,
    bookingDate: req.body.bookingDate,
    slotStart: req.body.slotStart,
    slotEnd: req.body.slotEnd,
  });

  if (!available) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Provider is not available for the selected slot");
  }

  const booking = await Booking.create({
    user: req.user._id,
    provider: provider._id,
    service: service._id,
    bookingDate: req.body.bookingDate,
    slotStart: req.body.slotStart,
    slotEnd: req.body.slotEnd,
    address: req.body.address,
    city: req.body.city,
    pincode: req.body.pincode,
    notes: req.body.notes,
    payment: {
      amount: service.price,
      status: "created",
      method: "mock_razorpay",
    },
  });

  await createNotification({
    recipient: provider._id,
    title: "New booking received",
    message: `${req.user.name} booked ${service.name}`,
    type: "booking",
    meta: { bookingId: booking._id },
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: booking });
});

export const getBookings = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "provider"
      ? { provider: req.user._id }
      : req.user.role === "admin"
        ? {}
        : { user: req.user._id };

  const bookings = await Booking.find(query)
    .populate("user", "name email")
    .populate("provider", "name email")
    .populate("service", "name price")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("service", "name");
  if (!booking) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Booking not found");
  }

  if (
    req.user.role === "provider" &&
    booking.provider.toString() !== req.user._id.toString()
  ) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Forbidden");
  }

  if (!ALLOWED_BOOKING_STATUSES.has(req.body.status)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Invalid booking status");
  }

  booking.status = req.body.status;
  await booking.save();

  await createNotification({
    recipient: booking.user,
    title: "Booking status updated",
    message: `${booking.service.name} is now ${booking.status}`,
    type: "booking-status",
    meta: { bookingId: booking._id },
  });

  res.json({ success: true, data: booking });
});

export const processMockPayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("service", "name");
  if (!booking) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Booking not found");
  }

  const ownsBooking =
    booking.user.toString() === req.user._id.toString() || req.user.role === "admin";
  if (!ownsBooking) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Forbidden");
  }

  if (booking.status === "cancelled") {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Cancelled bookings cannot be paid");
  }

  booking.payment.status = "paid";
  booking.payment.method = "mock_razorpay";
  booking.payment.transactionId = mockTransactionId();
  await booking.save();

  await createNotification({
    recipient: booking.provider,
    title: "Payment received",
    message: `Payment confirmed for ${booking.service?.name || "a booking"}`,
    type: "payment",
    meta: { bookingId: booking._id },
  });

  res.json({ success: true, data: booking });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("service", "name");
  if (!booking) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Booking not found");
  }

  const canCancel =
    req.user.role === "admin" ||
    booking.user.toString() === req.user._id.toString() ||
    booking.provider.toString() === req.user._id.toString();

  if (!canCancel) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Forbidden");
  }

  if (booking.status === "completed") {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Completed bookings cannot be cancelled");
  }

  booking.status = "cancelled";
  if (booking.payment.status === "paid") {
    booking.payment.status = "refunded";
  }
  await booking.save();

  const recipient =
    booking.user.toString() === req.user._id.toString() ? booking.provider : booking.user;

  await createNotification({
    recipient,
    title: "Booking cancelled",
    message: `${booking.service?.name || "Booking"} was cancelled`,
    type: "booking-cancelled",
    meta: { bookingId: booking._id },
  });

  res.json({ success: true, data: booking });
});

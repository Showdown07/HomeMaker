import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { requireFields } from "../utils/validators.js";

const recalculateProviderRating = async (providerId) => {
  const reviews = await Review.find({ provider: providerId });
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  await User.findByIdAndUpdate(providerId, {
    averageRating: Number(averageRating.toFixed(2)),
    totalReviews,
  });
};

export const createReview = asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ["bookingId", "rating"]);
  if (missing.length) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  if (Number(req.body.rating) < 1 || Number(req.body.rating) > 5) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Rating must be between 1 and 5");
  }

  const booking = await Booking.findById(req.body.bookingId).populate("service");
  if (!booking || booking.user.toString() !== req.user._id.toString()) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Booking not found");
  }

  if (booking.status !== "completed") {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Review allowed only after completion");
  }

  const existingReview = await Review.findOne({ booking: booking._id });
  if (existingReview) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("A review for this booking has already been submitted");
  }

  const review = await Review.create({
    user: req.user._id,
    provider: booking.provider,
    service: booking.service._id,
    booking: booking._id,
    rating: Number(req.body.rating),
    comment: req.body.comment,
  });

  await recalculateProviderRating(booking.provider);
  await createNotification({
    recipient: booking.provider,
    title: "New review received",
    message: `You received a ${req.body.rating}-star review`,
    type: "review",
    meta: { bookingId: booking._id, reviewId: review._id },
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: review });
});

export const getReviewsByProvider = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ provider: req.params.providerId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: reviews });
});

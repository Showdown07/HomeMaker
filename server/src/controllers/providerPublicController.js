import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Review from "../models/Review.js";

export const getProviderProfile = asyncHandler(async (req, res) => {
  const provider = await User.findOne({
    _id: req.params.id,
    role: "provider",
  }).select("-password");

  if (!provider) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Provider not found");
  }

  const [services, reviews] = await Promise.all([
    Service.find({ provider: provider._id, isActive: true }).sort({ createdAt: -1 }),
    Review.find({ provider: provider._id }).populate("user", "name").sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    data: {
      provider,
      services,
      reviews,
    },
  });
});

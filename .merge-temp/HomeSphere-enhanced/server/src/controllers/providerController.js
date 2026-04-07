import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const updateAvailability = asyncHandler(async (req, res) => {
  const provider = await User.findByIdAndUpdate(
    req.user._id,
    { availability: req.body.availability || [] },
    { new: true }
  );

  res.json({ success: true, data: provider });
});

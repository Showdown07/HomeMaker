import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import HelpRequest from "../models/HelpRequest.js";
import { requireFields } from "../utils/validators.js";

export const createHelpRequest = asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ["category", "title", "description", "city"]);
  if (missing.length) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  const helpRequest = await HelpRequest.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: helpRequest });
});

export const getMyHelpRequests = asyncHandler(async (req, res) => {
  const helpRequests = await HelpRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: helpRequests });
});

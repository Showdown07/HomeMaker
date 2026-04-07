import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import {
  isStrongPassword,
  isValidEmail,
  requireFields,
} from "../utils/validators.js";

export const registerUser = asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ["name", "email", "password"]);
  if (missing.length) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  if (!isValidEmail(req.body.email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Please provide a valid email address");
  }

  if (!isStrongPassword(req.body.password)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("User already exists");
  }

  const requestedRole = req.body.role === "provider" ? "provider" : "user";
  const user = await User.create({
    ...req.body,
    role: requestedRole,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Email and password are required");
  }

  if (!isValidEmail(req.body.email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Please provide a valid email address");
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await user.matchPassword(req.body.password))) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

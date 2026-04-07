import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { getJwtSecret } from "../config/env.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("Not authorized, token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("Invalid or expired token");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("Forbidden: insufficient role");
  }
  next();
};

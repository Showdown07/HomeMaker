import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import LocalContact from "../models/LocalContact.js";
import HelpRequest from "../models/HelpRequest.js";

export const getAdminOverview = asyncHandler(async (_req, res) => {
  const [users, providers, admins, services, bookings, reviews, helpRequests] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "provider" }),
    User.countDocuments({ role: "admin" }),
    Service.countDocuments({}),
    Booking.countDocuments({}),
    Review.countDocuments({}),
    HelpRequest.countDocuments({}),
  ]);

  const bookingStatusCounts = await Booking.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      stats: { users, providers, admins, services, bookings, reviews },
      helpRequests,
      bookingStatusCounts,
    },
  });
});

export const getAdminUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({})
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: users });
});

export const getAdminServices = asyncHandler(async (_req, res) => {
  const services = await Service.find({})
    .populate("provider", "name email role city")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: services });
});

export const getAdminBookings = asyncHandler(async (_req, res) => {
  const bookings = await Booking.find({})
    .populate("user", "name email role")
    .populate("provider", "name email role")
    .populate("service", "name category price")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
});

export const getAdminReviews = asyncHandler(async (_req, res) => {
  const reviews = await Review.find({})
    .populate("user", "name email")
    .populate("provider", "name email")
    .populate("service", "name category")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: reviews });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const allowedRoles = new Set(["user", "provider", "admin"]);
  if (!allowedRoles.has(req.body.role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  user.role = req.body.role;
  await user.save();

  res.json({ success: true, data: user });
});

export const toggleServiceActivation = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate("provider", "name email");
  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  service.isActive = typeof req.body.isActive === "boolean" ? req.body.isActive : !service.isActive;
  await service.save();

  res.json({ success: true, data: service });
});

export const getAdminLocalContacts = asyncHandler(async (_req, res) => {
  const contacts = await LocalContact.find({})
    .populate("addedBy", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: contacts });
});

export const createLocalContact = asyncHandler(async (req, res) => {
  const contact = await LocalContact.create({
    ...req.body,
    addedBy: req.user._id,
  });

  res.status(201).json({ success: true, data: contact });
});

export const updateLocalContact = asyncHandler(async (req, res) => {
  const contact = await LocalContact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Local contact not found");
  }

  Object.assign(contact, req.body);
  await contact.save();

  res.json({ success: true, data: contact });
});

export const deleteLocalContact = asyncHandler(async (req, res) => {
  const contact = await LocalContact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Local contact not found");
  }

  await contact.deleteOne();
  res.json({ success: true, message: "Local contact deleted" });
});

export const getAdminHelpRequests = asyncHandler(async (_req, res) => {
  const helpRequests = await HelpRequest.find({})
    .populate("user", "name email city")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: helpRequests });
});

export const updateHelpRequestStatus = asyncHandler(async (req, res) => {
  const helpRequest = await HelpRequest.findById(req.params.id);
  if (!helpRequest) {
    res.status(404);
    throw new Error("Help request not found");
  }

  const allowedStatuses = new Set(["open", "reviewing", "resolved"]);
  if (!allowedStatuses.has(req.body.status)) {
    res.status(400);
    throw new Error("Invalid help request status");
  }

  helpRequest.status = req.body.status;
  await helpRequest.save();

  res.json({ success: true, data: helpRequest });
});

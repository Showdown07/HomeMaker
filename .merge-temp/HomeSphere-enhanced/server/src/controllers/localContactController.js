import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import LocalContact from "../models/LocalContact.js";
import { requireFields } from "../utils/validators.js";

export const getPublicLocalContacts = asyncHandler(async (req, res) => {
  const { city, pincode, category } = req.query;
  const query = { isActive: true };

  if (city) {
    query.city = new RegExp(city, "i");
  }

  if (pincode) {
    query.pincode = pincode;
  }

  if (category) {
    query.category = new RegExp(category, "i");
  }

  const contacts = await LocalContact.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: contacts });
});

export const getAdminLocalContacts = asyncHandler(async (_req, res) => {
  const contacts = await LocalContact.find({}).sort({ createdAt: -1 });
  res.json({ success: true, data: contacts });
});

export const createLocalContact = asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ["name", "category", "phone", "city"]);
  if (missing.length) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  const contact = await LocalContact.create({
    ...req.body,
    addedBy: req.user._id,
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: contact });
});

export const updateLocalContact = asyncHandler(async (req, res) => {
  const contact = await LocalContact.findById(req.params.id);
  if (!contact) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Local contact not found");
  }

  Object.assign(contact, req.body);
  await contact.save();

  res.json({ success: true, data: contact });
});

export const deleteLocalContact = asyncHandler(async (req, res) => {
  const contact = await LocalContact.findById(req.params.id);
  if (!contact) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Local contact not found");
  }

  await contact.deleteOne();
  res.json({ success: true, message: "Local contact deleted" });
});

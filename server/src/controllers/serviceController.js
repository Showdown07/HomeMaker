import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import { rankServices } from "../services/rankingService.js";
import { requireFields } from "../utils/validators.js";

export const createService = asyncHandler(async (req, res) => {
  const missing = requireFields(req.body, ["name", "description", "category", "price"]);
  if (missing.length) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  const service = await Service.create({
    ...req.body,
    provider: req.user.role === "admin" && req.body.provider ? req.body.provider : req.user._id,
    city: req.user.city || req.body.city,
    pincode: req.user.pincode || req.body.pincode,
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: service });
});

export const getServices = asyncHandler(async (req, res) => {
  const { city, pincode, category, lat, lng, maxDistance = 25000 } = req.query;
  const serviceQuery = { isActive: true };

  if (city) serviceQuery.city = new RegExp(city, "i");
  if (pincode) serviceQuery.pincode = pincode;
  if (category) serviceQuery.category = category;

  const services = await Service.find(serviceQuery).populate("provider");

  let enrichedServices = services.map((service) => ({
    _id: service._id,
    name: service.name,
    description: service.description,
    category: service.category,
    price: service.price,
    city: service.city,
    pincode: service.pincode,
    durationMinutes: service.durationMinutes,
    tags: service.tags,
    provider: service.provider,
    distanceMeters: null,
  }));

  if (lat && lng) {
    const nearbyProviders = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: Number(maxDistance),
          query: { role: "provider" },
        },
      },
    ]);

    const distanceMap = new Map(
      nearbyProviders.map((provider) => [provider._id.toString(), provider.distanceMeters])
    );

    enrichedServices = enrichedServices
      .filter((service) => distanceMap.has(service.provider._id.toString()))
      .map((service) => ({
        ...service,
        distanceMeters: distanceMap.get(service.provider._id.toString()),
      }));
  }

  const rankedServices = rankServices(enrichedServices);
  res.json({ success: true, data: rankedServices });
});

export const getServiceById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Invalid service id");
  }

  const service = await Service.findById(req.params.id).populate("provider");
  if (!service) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Service not found");
  }

  const reviews = await Review.find({ service: service._id })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: { ...service.toObject(), reviews } });
});

export const updateService = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, provider: req.user._id };
  const service = await Service.findOne(query);

  if (!service) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Service not found");
  }

  Object.assign(service, req.body);
  await service.save();

  res.json({ success: true, data: service });
});

export const deleteService = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, provider: req.user._id };
  const service = await Service.findOne(query);

  if (!service) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Service not found");
  }

  service.isActive = false;
  await service.save();

  res.json({ success: true, message: "Service archived" });
});

export const getProviderServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id, isActive: true }).sort({
    createdAt: -1,
  });

  res.json({ success: true, data: services });
});

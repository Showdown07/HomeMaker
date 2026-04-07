import User from "../models/User.js";
import Service from "../models/Service.js";

export const createAuthFixtures = async () => {
  const provider = await User.create({
    name: "Provider One",
    email: "provider@test.com",
    password: "password123",
    role: "provider",
    city: "Bengaluru",
    pincode: "560001",
    location: { type: "Point", coordinates: [77.5946, 12.9716] },
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
    ],
  });

  const user = await User.create({
    name: "Customer One",
    email: "user@test.com",
    password: "password123",
    role: "user",
    city: "Bengaluru",
    pincode: "560001",
    location: { type: "Point", coordinates: [77.6, 12.97] },
  });

  const admin = await User.create({
    name: "Admin User",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
    city: "Bengaluru",
    pincode: "560001",
    location: { type: "Point", coordinates: [77.58, 12.98] },
  });

  const service = await Service.create({
    name: "Deep Cleaning",
    description: "Apartment deep cleaning",
    category: "cleaning",
    price: 1499,
    city: "Bengaluru",
    pincode: "560001",
    provider: provider._id,
  });

  return { provider, user, admin, service };
};

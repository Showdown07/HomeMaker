import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

dotenv.config();
await connectDB();

await User.deleteMany();
await Service.deleteMany();
await Booking.deleteMany();
await Review.deleteMany();

const provider = await User.create({
  name: "Ravi Kumar",
  email: "provider@example.com",
  password: "password123",
  role: "provider",
  city: "Bengaluru",
  pincode: "560001",
  location: { type: "Point", coordinates: [77.5946, 12.9716] },
  skills: ["cleaning", "electrician"],
  availability: [
    { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
  ],
});

await User.create({
  name: "Demo User",
  email: "user@example.com",
  password: "password123",
  role: "user",
  city: "Bengaluru",
  pincode: "560001",
  location: { type: "Point", coordinates: [77.6, 12.97] },
});

await User.create({
  name: "Admin Console",
  email: "admin@example.com",
  password: "password123",
  role: "admin",
  city: "Bengaluru",
  pincode: "560001",
  location: { type: "Point", coordinates: [77.58, 12.98] },
});

await Service.create([
  {
    name: "Deep Home Cleaning",
    description: "Complete cleaning for apartments and villas.",
    category: "cleaning",
    price: 2499,
    city: "Bengaluru",
    pincode: "560001",
    provider: provider._id,
    tags: ["premium", "same-day"],
  },
  {
    name: "Certified Electrician Visit",
    description: "Wiring, switchboards, and appliance fixes.",
    category: "electrician",
    price: 699,
    city: "Bengaluru",
    pincode: "560001",
    provider: provider._id,
    tags: ["verified", "fast"],
  },
]);

console.log("Seeded demo data");
process.exit(0);

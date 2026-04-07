import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import LocalContact from "../models/LocalContact.js";
import HelpRequest from "../models/HelpRequest.js";

dotenv.config();
await connectDB();

await User.deleteMany();
await Service.deleteMany();
await Booking.deleteMany();
await Review.deleteMany();
await LocalContact.deleteMany();
await HelpRequest.deleteMany();

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

const admin = await User.create({
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

await LocalContact.create([
  {
    name: "Shankar Plumbing Works",
    category: "plumber",
    phone: "9876543210",
    alternatePhone: "9876500000",
    city: "Bengaluru",
    pincode: "560001",
    area: "MG Road",
    address: "MG Road, Bengaluru",
    notes: "Field-verified local plumber, not onboarded on platform yet.",
    addedBy: admin._id,
  },
  {
    name: "Lakshmi Home Cleaning",
    category: "cleaning",
    phone: "9123456780",
    city: "Bengaluru",
    pincode: "560001",
    area: "Indiranagar",
    address: "Indiranagar, Bengaluru",
    notes: "Neighborhood cleaning contact collected by admin field team.",
    addedBy: admin._id,
  },
]);

console.log("Seeded demo data");
process.exit(0);

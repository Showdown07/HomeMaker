import mongoose from "mongoose";
import { SERVICE_CATEGORIES } from "../constants/serviceCategories.js";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: SERVICE_CATEGORIES,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    city: String,
    pincode: String,
    durationMinutes: {
      type: Number,
      default: 60,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);

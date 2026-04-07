import mongoose from "mongoose";

const helpRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    lat: Number,
    lng: Number,
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("HelpRequest", helpRequestSchema);

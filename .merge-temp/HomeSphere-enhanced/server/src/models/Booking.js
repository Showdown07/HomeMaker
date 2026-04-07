import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    slotStart: {
      type: String,
      required: true,
    },
    slotEnd: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    address: {
      type: String,
      required: true,
    },
    city: String,
    pincode: String,
    notes: String,
    payment: {
      method: {
        type: String,
        default: "mock_razorpay",
      },
      status: {
        type: String,
        enum: ["created", "paid", "failed", "refunded"],
        default: "created",
      },
      transactionId: String,
      amount: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);

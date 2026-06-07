// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A booking must belong to a user."],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: [true, "A booking must have an assigned service provider."],
    },
    address: {
      houseNumber: { type: String },
      street: { type: String, required: true },
      phone: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
      deliveryInstructions: { type: String, trim: true },
    },
    schedule: {
      bookingDate: {
        type: Date,
        required: [true, "Please specify the date for the service execution."],
      },
      startTime: {
        type: String,
        required: [true, "Please specify the starting time slot."],
      },
      durationDays: {
        type: Number,
        default: 1,
      },
      requiresOvertime: {
        type: Boolean,
        default: false,
      },
      overtimeHours: {
        type: Number,
        default: 0,
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: [true, "Base provider price is required."],
      },
      overtimeTotal: {
        type: Number,
        default: 0,
      },
      platformFee: {
        type: Number,
        required: true,
        default: 50,
      },
      grandTotal: {
        type: Number,
        required: [true, "Grand total amount is mandatory for checkout."],
      },
    },
    payment: {
      method: {
        type: String,
        enum: ["COD", "Razorpay", "Wallet", "Card"],
        required: [true, "Payment method selection is mandatory."],
      },
      status: {
        type: String,
        enum: ["pending", "authorized", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: {
        type: String,
        default: "",
      },
      paidAt: {
        type: Date,
      },
    },
    bookingStatus: {
      type: String,
      enum: ["requested", "accepted", "rejected", "ongoing", "completed", "cancelled"],
      default: "requested",
    },
    // =========================================================================
    // NEW PERSISTENT FIELD: Tracks if the user has finalized rating submissions
    // =========================================================================
    isReviewed: {
      type: Boolean,
      default: false,
      required: true
    },
    cancellation: {
      cancelledBy: { type: String, enum: ["user", "provider", "admin"] },
      reason: { type: String, default: "" },
      cancelledAt: { type: Date },
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [500, "Instructions cannot exceed 500 characters."],
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ user: 1, bookingStatus: 1 });
BookingSchema.index({ provider: 1, bookingStatus: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
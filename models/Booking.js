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
      ref: "Provider", // Assuming your service provider model name is 'Provider'
      required: [true, "A booking must have a assigned service provider."],
    },
    // The specific address snapshot where the provider needs to deliver the service
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
    // Schedule details configuration
    schedule: {
      bookingDate: {
        type: Date,
        required: [true, "Please specify the date for the service execution."],
      },
      startTime: {
        type: String, // e.g., "10:00 AM" or "14:30"
        required: [true, "Please specify the starting time slot."],
      },
      durationDays: {
        type: Number,
        default: 1, // Defaulting to a single day deployment
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
    // Strict Pricing calculation breakdown (Checked out and validated server-side)
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
        default: 50, // Fixed or variable convenience platform charges
      },
      grandTotal: {
        type: Number,
        required: [true, "Grand total amount is mandatory for checkout."],
      },
    },
    // Payment status tracking architecture
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
        type: String, // Payment Gateway reference order ID (e.g. Razorpay Order ID)
        default: "",
      },
      paidAt: {
        type: Date,
      },
    },
    // Core functional business status machine
    bookingStatus: {
      type: String,
      enum: ["requested", "accepted", "rejected", "ongoing", "completed", "cancelled"],
      default: "requested",
    },
    cancellation: {
      cancelledBy: { type: String, enum: ["user", "provider", "admin"] },
      reason: { type: String, default: "" },
      cancelledAt: { type: Date },
    },
    notes: {
      type: String, // Special custom instructions left by the user during checkout
      trim: true,
      maxLength: [500, "Instructions cannot exceed 500 characters."],
    },
  },
  {
    timestamps: true, // Tracks automatic generation of createdAt and updatedAt dates
  }
);

// Compound Indexing for optimized database reads during pipeline updates
BookingSchema.index({ user: 1, bookingStatus: 1 });
BookingSchema.index({ provider: 1, bookingStatus: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
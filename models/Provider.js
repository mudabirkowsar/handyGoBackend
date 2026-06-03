// models/Provider.js

const mongoose = require("mongoose");

// Sub-schema for individual services provided by the professional
const specificServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // e.g., "Hand Mehndi", "Foot Mehndi"
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  durationInMins: {
    type: Number, // Estimated time taken for this service
    default: 60,
  }
});

const providerSchema = new mongoose.Schema(
  {
    // =====================================================
    // AUTH & ROLE
    // =====================================================
    role: {
      type: String,
      enum: ["provider"],
      default: "provider",
    },

    authType: {
      type: String,
      enum: ["phone", "google", "apple", "email"],
      default: "phone",
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      code: String,
      expiresAt: Date,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    // =====================================================
    // BASIC PROFILE
    // =====================================================
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 500,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dateOfBirth: Date,

    languages: [String],

    experienceYears: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // PROFESSIONAL DETAILS & PRICING
    // =====================================================
    mainCategory: {
      type: String,
      // required: true, // e.g., "Mehndi Artist", "Electrician"
    },

    // Array of granular services with distinct pricing
    services: [specificServiceSchema],

    // General default base rates requested
    perDayPrice: {
      type: Number,
      default: 0,
    },

    overtimeHourlyPrice: {
      type: Number,
      default: 0,
    },

    skills: [String],

    // =====================================================
    // LOCATION
    // =====================================================
    address: {
      houseNumber: String,
      street: String,
      landmark: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },

    serviceRadiusKm: {
      type: Number,
      default: 10,
    },

    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },

    // =====================================================
    // AVAILABILITY
    // =====================================================
    isOnline: {
      type: Boolean,
      default: false,
    },

    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    workingHours: {
      monday: { isAvailable: { type: Boolean, default: true }, start: String, end: String },
      tuesday: { isAvailable: { type: Boolean, default: true }, start: String, end: String },
      wednesday: { isAvailable: { type: Boolean, default: true }, start: String, end: String },
      thursday: { isAvailable: { type: Boolean, default: true }, start: String, end: String },
      friday: { isAvailable: { type: Boolean, default: true }, start: String, end: String },
      saturday: { isAvailable: { type: Boolean, default: true }, start: String, end: String },
      sunday: { isAvailable: { type: Boolean, default: false }, start: String, end: String },
    },

    overtime: {
      isOvertimeEnabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String, // e.g., "18:00"
        default: ""
      },
      end: {
        type: String, // e.g., "22:00"
        default: ""
      }
    },

    // =====================================================
    // DOCUMENT VERIFICATION
    // =====================================================
    aadhaarNumber: String,
    panNumber: String,
    aadhaarFrontImage: String,
    aadhaarBackImage: String,
    selfieImage: String,

    verificationStatus: {
      type: String,
      enum: ["pending", "incomplete", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: String,
    verifiedAt: Date,

    // =====================================================
    // RATINGS & PERFORMANCE
    // =====================================================
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalBookings: {
      type: Number,
      default: 0,
    },

    completedBookings: {
      type: Number,
      default: 0,
    },

    cancelledBookings: {
      type: Number,
      default: 0,
    },

    completionRate: {
      type: Number,
      default: 0,
    },

    responseRate: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // EARNINGS & WALLET
    // =====================================================
    walletBalance: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    totalWithdrawn: {
      type: Number,
      default: 0,
    },

    commissionPercentage: {
      type: Number,
      default: 10,
    },

    // =====================================================
    // BANK DETAILS
    // =====================================================
    bankDetails: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String,
    },

    // =====================================================
    // PORTFOLIO
    // =====================================================
    portfolioImages: [String],

    beforeAfterImages: [
      {
        before: String,
        after: String,
      },
    ],

    // =====================================================
    // DEVICE & NOTIFICATIONS
    // =====================================================
    deviceTokens: [String],

    notificationPreferences: {
      bookingAlerts: { type: Boolean, default: true },
      marketingNotifications: { type: Boolean, default: true },
      payoutNotifications: { type: Boolean, default: true },
    },

    // =====================================================
    // ACCOUNT STATUS
    // =====================================================
    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },

    lastSeenAt: Date,

    // =====================================================
    // SUBSCRIPTION / BOOST
    // =====================================================
    subscriptionPlan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },

    boostExpiresAt: Date,

    // =====================================================
    // REFERRAL SYSTEM
    // =====================================================
    referralCode: String,

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================
providerSchema.index({ location: "2dsphere" });
providerSchema.index({ fullName: "text", skills: "text" });
providerSchema.index({ mainCategory: 1, averageRating: -1 });

const Provider = mongoose.model("Provider", providerSchema);
module.exports = Provider;
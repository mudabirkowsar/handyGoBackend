// models/Company.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    // =====================================================
    // AUTH & ROLE
    // =====================================================
    role: {
      type: String,
      enum: ["company"],
      default: "company",
    },

    authType: {
      type: String,
      enum: ["phone", "google", "email"],
      default: "phone",
    },

    companyPhone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    companyEmail: {
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

    refreshToken: {
      type: String,
      select: false,
    },

    // =====================================================
    // COMPANY PROFILE
    // =====================================================
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    companyLogo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      maxlength: 2000,
    },

    foundedYear: Number,

    website: String,

    companySize: {
      type: String,
      enum: [
        "1-5",
        "6-10",
        "11-25",
        "26-50",
        "51-100",
        "100+",
      ],
      default: "1-5",
    },

    // =====================================================
    // OWNER / MANAGER DETAILS
    // =====================================================
    ownerName: {
      type: String,
      required: true,
    },

    ownerPhone: String,

    ownerEmail: String,

    managerName: String,

    managerPhone: String,

    // =====================================================
    // SERVICE DETAILS
    // =====================================================
    serviceCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
      },
    ],

    services: [
      {
        title: {
          type: String,
          required: true,
        },

        description: String,

        basePrice: {
          type: Number,
          required: true,
        },

        pricingType: {
          type: String,
          enum: ["fixed", "hourly", "inspection"],
          default: "fixed",
        },

        estimatedDurationMinutes: Number,

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // =====================================================
    // EMPLOYEES / WORKERS
    // =====================================================
    workers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
      },
    ],

    totalWorkers: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // LOCATION
    // =====================================================
    address: {
      officeNumber: String,
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
        // default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },

    serviceRadiusKm: {
      type: Number,
      default: 25,
    },

    // =====================================================
    // BUSINESS HOURS
    // =====================================================
    businessHours: {
      monday: {
        isOpen: {
          type: Boolean,
          default: true,
        },
        open: String,
        close: String,
      },

      tuesday: {
        isOpen: {
          type: Boolean,
          default: true,
        },
        open: String,
        close: String,
      },

      wednesday: {
        isOpen: {
          type: Boolean,
          default: true,
        },
        open: String,
        close: String,
      },

      thursday: {
        isOpen: {
          type: Boolean,
          default: true,
        },
        open: String,
        close: String,
      },

      friday: {
        isOpen: {
          type: Boolean,
          default: true,
        },
        open: String,
        close: String,
      },

      saturday: {
        isOpen: {
          type: Boolean,
          default: true,
        },
        open: String,
        close: String,
      },

      sunday: {
        isOpen: {
          type: Boolean,
          default: false,
        },
        open: String,
        close: String,
      },
    },

    // =====================================================
    // DOCUMENTS & VERIFICATION
    // =====================================================
    gstNumber: String,

    panNumber: String,

    cinNumber: String,

    businessRegistrationNumber: String,

    gstCertificate: String,

    businessLicense: String,

    insuranceDocument: String,

    ownerIdProof: String,

    companyPhotos: [String],

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: String,

    verifiedAt: Date,

    // =====================================================
    // RATINGS & ANALYTICS
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

    responseRate: {
      type: Number,
      default: 0,
    },

    completionRate: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // FINANCIAL
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
      default: 12,
    },

    bankDetails: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String,
    },

    // =====================================================
    // SUBSCRIPTION SYSTEM
    // =====================================================
    subscriptionPlan: {
      type: String,
      enum: ["free", "basic", "premium", "enterprise"],
      default: "free",
    },

    subscriptionStartDate: Date,

    subscriptionExpiresAt: Date,

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // PORTFOLIO
    // =====================================================
    portfolioImages: [String],

    completedProjectImages: [String],

    certifications: [
      {
        title: String,
        image: String,
      },
    ],

    // =====================================================
    // NOTIFICATIONS
    // =====================================================
    deviceTokens: [String],

    notificationPreferences: {
      bookingAlerts: {
        type: Boolean,
        default: true,
      },

      payoutNotifications: {
        type: Boolean,
        default: true,
      },

      marketingNotifications: {
        type: Boolean,
        default: true,
      },
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

    isActive: {
      type: Boolean,
      default: true,
    },

    lastSeenAt: Date,
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

// GEO SEARCH
companySchema.index({ location: "2dsphere" });

// TEXT SEARCH
companySchema.index({
  companyName: "text",
  description: "text",
});

// FILTERING
companySchema.index({
  averageRating: -1,
  verificationStatus: 1,
});

// =====================================================
// MODEL
// =====================================================

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
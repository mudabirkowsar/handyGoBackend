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

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],

    companyPhone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    companyEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      select: false,
    },

    refreshToken: {
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
      default: "",
    },

    foundedYear: {
      type: Number,
    },

    website: {
      type: String,
      default: "",
    },

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
    // OWNER DETAILS
    // =====================================================

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerPhone: {
      type: String,
      default: "",
    },

    ownerEmail: {
      type: String,
      default: "",
    },

    managerName: {
      type: String,
      default: "",
    },

    managerPhone: {
      type: String,
      default: "",
    },

    // =====================================================
    // WORKERS
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

    gstNumber: {
      type: String,
      default: "",
    },

    panNumber: {
      type: String,
      default: "",
    },

    cinNumber: {
      type: String,
      default: "",
    },

    businessRegistrationNumber: {
      type: String,
      default: "",
    },

    gstCertificate: {
      type: String,
      default: "",
    },

    businessLicense: {
      type: String,
      default: "",
    },

    insuranceDocument: {
      type: String,
      default: "",
    },

    ownerIdProof: {
      type: String,
      default: "",
    },

    companyPhotos: [
      {
        type: String,
      },
    ],

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected",],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    verifiedAt: {
      type: Date,
    },

    // =====================================================
    // RATINGS
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
    // SUBSCRIPTION
    // =====================================================

    subscriptionPlan: {
      type: String,
      enum: [
        "free",
        "basic",
        "premium",
        "enterprise",
      ],
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

    blockedReason: {
      type: String,
      default: "",
    },

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

companySchema.index({
  location: "2dsphere",
});

companySchema.index({
  companyName: "text",
  description: "text",
});

companySchema.index({
  averageRating: -1,
  verificationStatus: 1,
});

// =====================================================
// MODEL
// =====================================================

const Company = mongoose.model(
  "Company",
  companySchema
);

module.exports = Company;
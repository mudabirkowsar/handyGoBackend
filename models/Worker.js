// models/Worker.js
const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        // =====================================================
        // BASIC AUTH
        // =====================================================
        role: {
            type: String,
            enum: ["worker"],
            default: "worker",
        },

        authType: {
            type: String,
            enum: ["phone", "email"],
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

        refreshToken: {
            type: String,
            select: false,
        },

        // =====================================================
        // PERSONAL DETAILS
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

        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },

        dateOfBirth: Date,

        bio: {
            type: String,
            maxlength: 500,
        },

        languages: [String],

        // =====================================================
        // COMPANY RELATION
        // =====================================================
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        employeeId: {
            type: String,
            unique: true,
        },

        joiningDate: Date,

        designation: {
            type: String,
            default: "Worker",
        },

        // =====================================================
        // PROFESSIONAL DETAILS
        // =====================================================
        serviceCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceCategory",
            required: true,
        },

        skills: [String],

        experienceYears: {
            type: Number,
            default: 0,
        },

        hourlyRate: {
            type: Number,
            default: 0,
        },

        services: [
            {
                title: String,
                description: String,
                price: Number,
                isActive: {
                    type: Boolean,
                    default: true,
                },
            },
        ],

        // =====================================================
        // LOCATION
        // =====================================================
        currentLocation: {
            lat: Number,
            lng: Number,
            updatedAt: Date,
        },

        address: {
            houseNumber: String,
            street: String,
            landmark: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
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
            default: "offline",
        },

        workingHours: {
            monday: {
                isAvailable: {
                    type: Boolean,
                    default: true,
                },
                start: String,
                end: String,
            },

            tuesday: {
                isAvailable: {
                    type: Boolean,
                    default: true,
                },
                start: String,
                end: String,
            },

            wednesday: {
                isAvailable: {
                    type: Boolean,
                    default: true,
                },
                start: String,
                end: String,
            },

            thursday: {
                isAvailable: {
                    type: Boolean,
                    default: true,
                },
                start: String,
                end: String,
            },

            friday: {
                isAvailable: {
                    type: Boolean,
                    default: true,
                },
                start: String,
                end: String,
            },

            saturday: {
                isAvailable: {
                    type: Boolean,
                    default: true,
                },
                start: String,
                end: String,
            },

            sunday: {
                isAvailable: {
                    type: Boolean,
                    default: false,
                },
                start: String,
                end: String,
            },
        },

        // =====================================================
        // DOCUMENTS & VERIFICATION
        // =====================================================
        aadhaarNumber: String,

        panNumber: String,

        aadhaarFrontImage: String,

        aadhaarBackImage: String,

        selfieImage: String,

        policeVerificationDocument: String,

        tradeCertificate: String,

        verificationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        verifiedAt: Date,

        rejectionReason: String,

        // =====================================================
        // PERFORMANCE
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

        totalAssignedBookings: {
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
        // EARNINGS
        // =====================================================
        totalEarnings: {
            type: Number,
            default: 0,
        },

        pendingEarnings: {
            type: Number,
            default: 0,
        },

        salaryType: {
            type: String,
            enum: ["fixed", "commission", "hybrid"],
            default: "commission",
        },

        commissionPercentage: {
            type: Number,
            default: 0,
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
            bookingAlerts: {
                type: Boolean,
                default: true,
            },

            payoutNotifications: {
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

// FAST SEARCH
workerSchema.index({
    fullName: "text",
    skills: "text",
});

// COMPANY FILTER
workerSchema.index({
    companyId: 1,
    serviceCategory: 1,
});

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;
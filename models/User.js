// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        tokens: [{
            token: {
                type: String,
                required: true
            },
            signedAt: {
                type: Date,
                default: Date.now
            }
        }],
        // =====================================================
        // AUTH & ACCOUNT
        // =====================================================
        role: {
            type: String,
            enum: ["customer"],
            default: "customer",
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
        // PROFILE
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

        preferredLanguage: {
            type: String,
            default: "English",
        },

        // =====================================================
        // LOCATION
        // =====================================================
        currentLocation: {
            lat: Number,
            lng: Number,
            updatedAt: Date,
        },

        defaultAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
        },

        savedAddresses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Address",
            },
        ],

        // =====================================================
        // BOOKINGS & ACTIVITY
        // =====================================================
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

        lastBookingAt: Date,


        // =====================================================
        // PAYMENT
        // =====================================================
        walletBalance: {
            type: Number,
            default: 0,
        },

        savedCards: [
            {
                cardHolderName: String,
                last4Digits: String,
                brand: String,
                expiryMonth: String,
                expiryYear: String,
            },
        ],

        preferredPaymentMethod: {
            type: String,
            enum: ["cash", "upi", "card", "wallet"],
            default: "cash",
        },

        // =====================================================
        // COUPONS & REWARDS
        // =====================================================
        rewardPoints: {
            type: Number,
            default: 0,
        },

        referralCode: String,

        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // =====================================================
        // NOTIFICATIONS
        // =====================================================
        deviceTokens: [String],

        notificationPreferences: {
            bookingUpdates: {
                type: Boolean,
                default: true,
            },

            promotionalNotifications: {
                type: Boolean,
                default: true,
            },

            paymentNotifications: {
                type: Boolean,
                default: true,
            },
        },

        // =====================================================
        // PRIVACY & SECURITY
        // =====================================================
        lastLoginAt: Date,

        loginAttempts: {
            type: Number,
            default: 0,
        },

        accountLockedUntil: Date,

        isBlocked: {
            type: Boolean,
            default: false,
        },

        blockedReason: String,

        isDeleted: {
            type: Boolean,
            default: false,
        },

        // =====================================================
        // ANALYTICS
        // =====================================================
        totalSpent: {
            type: Number,
            default: 0,
        },

        averageOrderValue: {
            type: Number,
            default: 0,
        },

        // =====================================================
        // APP SETTINGS
        // =====================================================
        appSettings: {
            darkMode: {
                type: Boolean,
                default: false,
            },

            locationEnabled: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({
    fullName: "text",
    email: "text",
});

// BOOKINGS FILTER
userSchema.index({
    createdAt: -1,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
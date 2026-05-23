// models/Admin.js

const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        // =========================================
        // BASIC INFO
        // =========================================
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            default: "",
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        profileImage: {
            type: String,
            default: "",
        },

        // =========================================
        // ROLE
        // =========================================
        role: {
            type: String,
            enum: ["admin"],
            default: "admin",
        },

        // =========================================
        // PERMISSIONS
        // =========================================
        permissions: [
            {
                type: String,
            },
        ],

        // =========================================
        // SECURITY
        // =========================================
        isActive: {
            type: Boolean,
            default: true,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },

        lastLoginAt: {
            type: Date,
        },

        refreshToken: {
            type: String,
            default: "",
            select: false,
        },

        // =========================================
        // NOTIFICATIONS
        // =========================================
        fcmToken: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Admin = mongoose.model(
    "Admin",
    adminSchema
);

module.exports = Admin;
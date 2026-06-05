// models/Address.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // Speeds up fetching all addresses for a specific user
        },
        addressType: {
            type: String,
            enum: ["Home", "Work", "Other"],
            default: "Home",
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true, // Recipient name if different from account holder
        },
        phone: {
            type: String,
            required: true,
            trim: true, // Contact number specifically for delivery
        },
        alternatePhone: {
            type: String,
            trim: true,
        },
        flatHouseNo: {
            type: String,
            required: true,
            trim: true, // Flat, House no., Building, Company, Apartment
        },
        streetAddress: {
            type: String,
            required: true,
            trim: true, // Area, Colony, Street, Sector, Village
        },
        landmark: {
            type: String,
            trim: true, // E.g., "Near Apollo Hospital"
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            default: "India",
            trim: true,
        },
        pincode: {
            type: String,
            required: true,
            trim: true, // Postal code / Zip code
        },
        // Professional delivery notes
        deliveryInstructions: {
            type: String,
            trim: true, // E.g., "Leave with security", "Ring bell twice", "Call before arrival"
        },
        isDefault: {
            type: Boolean,
            default: false, // Easily mark which address to auto-select at checkout
        },
    },
    {
        timestamps: true,
    }
);

// Geo-spatial index for delivery radius tracking if needed in the future
addressSchema.index({ location: "2dsphere" });

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;
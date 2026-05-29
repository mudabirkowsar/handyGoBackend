// models/Worker.js

const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        // BASIC INFO
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        profileImage: {
            type: String,
            default: "",
        },

        serviceProvided: {
            //like "Plumbing", "Electrical", etc.
            type: String,
            required: true,
        },

        // COMPANY INFO
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        employeeId: {
            type: String,
        },

        designation: {
            type: String,
            default: "Worker",
        },

        // WORK DETAILS
        skills: [String],

        experienceYears: {
            type: Number,
            default: 0,
        },

        // ADDRESS
        address: {
            city: String,
            state: String,
            country: String,
        },

        // STATUS
        isAvailable: {
            type: Boolean,
            default: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;
const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true, // Automatically cleans up accidental trailing/leading spaces
        },

        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const ServiceCategory = mongoose.model(
    "ServiceCategory",
    serviceCategorySchema
);

module.exports = ServiceCategory;
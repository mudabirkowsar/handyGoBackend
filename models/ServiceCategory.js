const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },

        icon: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

         image: {
            type: String,
            default: "",
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

const ServiceCategory = mongoose.model(
    "ServiceCategory",
    serviceCategorySchema
);

module.exports = ServiceCategory;
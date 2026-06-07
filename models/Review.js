// models/Review.js
const mongoose = require("mongoose");
const Provider = require("./Provider");

const ReviewSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: [true, "A review must look up a verified booking reference ID."],
            unique: true, // Restricts user to exactly one review submission entry per order
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Review must belong to a client user author."],
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider",
            required: [true, "Review must target an assigned service provider."],
        },
        rating: {
            type: Number,
            required: [true, "Please supply a metric score rating between 1 and 5."],
            min: [1, "Rating scale floor cannot drop below 1."],
            max: [5, "Rating scale ceiling cannot exceed 5."],
        },
        comment: {
            type: String,
            trim: true,
            maxLength: [500, "Review commentary text limits remain capped at 500 characters."],
        },
    },
    { timestamps: true }
);
// Post-save middleware hook to compute averages
// ReviewSchema.post("save", function () {
//     // Access static function on Provider construction pointer
//     this.constructor.calculateAverageRatingMetrics(this.provider);
// });

// Compound indexing to accelerate dashboard statistics aggregation queries
ReviewSchema.index({ provider: 1, rating: -1 });

module.exports = mongoose.model("Review", ReviewSchema);
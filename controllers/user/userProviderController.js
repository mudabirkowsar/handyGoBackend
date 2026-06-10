// controllers/userProviderController.js

// controllers/reviewController.js
const Review = require("../../models/Review");
const Provider = require("../../models/Provider");
const mongoose = require("mongoose");

// =====================================================
// CONTROLLER 1: GET ALL NEARBY PROVIDERS (Summary List)
// =====================================================
// controllers/providerController.js
exports.getNearbyProviders = async (req, res) => {
    try {
        const { lng, lat, radiusKm, serviceProvided } = req.query;

        // =====================================================
        // DEFAULT IN-BUILT CONFIGURATIONS (FALLBACK VALUES)
        // =====================================================
        // Explicitly fallback to Jalandhar, Punjab, India if missing from frontend query
        const userLng = lng ? parseFloat(lng) : 75.5792;
        const userLat = lat ? parseFloat(lat) : 31.3260;

        // Defaulting search radius to 1500 kilometers if missing
        const searchRadiusKm = radiusKm ? parseFloat(radiusKm) : 1500;
        const maxDistanceInMeters = searchRadiusKm * 1000;

        // Safety and vetting rules applied to all queries
        const matchFilters = {
            isBlocked: false,
            isDeleted: false,
            verificationStatus: "approved",
        };

        // Only apply the service filter if the frontend explicitly sends it
        if (serviceProvided && serviceProvided.trim() !== "") {
            matchFilters.serviceProvided = { $regex: new RegExp(serviceProvided.trim(), "i") };
        }

        // =====================================================
        // GEOSPATIAL AGGREGATION PIPELINE
        // =====================================================
        const nearbyProviders = await Provider.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [userLng, userLat] },
                    distanceField: "distanceFromUserKm",
                    maxDistance: maxDistanceInMeters,
                    spherical: true,
                    distanceMultiplier: 0.001, // Converts meters back to Kilometers
                    query: matchFilters, // Injects status constraints and optional category queries
                },
            },
            {
                // Light optimization: Exclude heavy documents for the list view
                $project: {
                    _id: 1,
                    fullName: 1,
                    profileImage: 1,
                    bio: 1,
                    gender: 1,
                    experienceYears: 1,
                    serviceProvided: 1,
                    perDayPrice: 1,
                    averageRating: 1,
                    totalReviews: 1,
                    isOnline: 1,
                    availabilityStatus: 1,
                    distanceFromUserKm: { $round: ["$distanceFromUserKm", 2] },
                },
            },
            {
                // Sort priority: Active online slots display first, then nearest physical distance
                $sort: { isOnline: -1, distanceFromUserKm: 1 },
            },
        ]);

        res.status(200).json({
            success: true,
            count: nearbyProviders.length,
            coordinatesUsed: [userLng, userLat],
            searchRadiusKm,
            data: nearbyProviders,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================================================
// CONTROLLER 2: GET FULL DETAIL BY ID
// =====================================================
exports.getProviderDetails = async (req, res) => {
    try {
        const { providerId } = req.params;

        // Fetch the provider and explicitly select/exclude appropriate fields
        const provider = await Provider.findOne({
            _id: providerId,
            isBlocked: false,
            isDeleted: false,
            verificationStatus: "approved" // Safety check to prevent unauthorized ID access
        })
            .select("-password -refreshToken -deviceTokens -otp") // Strip sensitive system/security configurations
            .select("-bankDetails -aadhaarNumber -panNumber -aadhaarFrontImage -aadhaarBackImage"); // Strip private backend documentation

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider profile not found, or is no longer accessible.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Detailed provider profile fetched successfully",
            data: provider, // Returns complete structure (services array, portfolio, working hours, etc.)
        });
    } catch (error) {
        // Catch invalid MongoDB ObjectIDs gracefully
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid Provider Identifier." });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Verify provider existence prior to executing database lookups
    const providerExists = await Provider.findById(providerId);
    if (!providerExists) {
      return res.status(404).json({
        success: false,
        message: "Target service provider profile could not be identified."
      });
    }

    // Pull individual reviews, populate author profile details, and sort by latest
    const reviews = await Review.find({ provider: providerId })
      .populate("user", "fullName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not retrieve customer feedback records.",
      error: error.message
    });
  }
};

// @desc     Get aggregated star ratings analytics matrix breakdown for a specific Provider
// @route    GET /api/reviews/provider/:providerId/stats
// @access   Public
exports.getProviderRatingStats = async (req, res) => {
  try {
    const { providerId } = req.params;

    const providerExists = await Provider.findById(providerId);
    if (!providerExists) {
      return res.status(404).json({
        success: false,
        message: "Target service provider profile could not be identified."
      });
    }

    // MongoDB Pipeline to aggregate general stats and count distributions simultaneously
    const statsPipeline = await Review.aggregate([
      { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
      {
        $group: {
          _id: "$provider",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } }
        }
      }
    ]);

    // Fallback analytics matrix defaults if no ratings are found in the collections
    const ratingSummary = statsPipeline.length > 0 ? {
      averageRating: Math.round(statsPipeline[0].averageRating * 10) / 10,
      totalReviews: statsPipeline[0].totalReviews,
      breakdown: {
        5: statsPipeline[0].fiveStar,
        4: statsPipeline[0].fourStar,
        3: statsPipeline[0].threeStar,
        2: statsPipeline[0].twoStar,
        1: statsPipeline[0].oneStar
      }
    } : {
      averageRating: 0,
      totalReviews: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    res.status(200).json({
      success: true,
      data: ratingSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not calculate portfolio aggregation matrices.",
      error: error.message
    });
  }
};
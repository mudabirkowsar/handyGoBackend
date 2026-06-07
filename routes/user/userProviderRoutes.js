// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { getNearbyProviders, getProviderDetails, getProviderReviews, getProviderRatingStats } = require("../../controllers/user/userProviderController");

// Route 1: List all nearby providers with summary data
router.get("/providers/nearby", getNearbyProviders);
router.get("/providers/:providerId", getProviderDetails);

router.get("/provider/reviews/:providerId", getProviderReviews);
router.get("/provider/reviewstars/:providerId", getProviderRatingStats);

module.exports = router;
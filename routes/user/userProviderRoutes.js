// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { getNearbyProviders, getProviderDetails } = require("../../controllers/user/userProviderController");

// Route 1: List all nearby providers with summary data
router.get("/providers/nearby", getNearbyProviders);

// Route 2: Get complete structural data details of one individual provider by ID
router.get("/providers/:providerId", getProviderDetails);

module.exports = router;
const express = require("express");
const router = express.Router();

const { getProviderBookings, respondToBookingRequest, updateJobExecutionStatus } = require("../../controllers/provider/providerBookingController");

// Import your auth token middleware layers
const { protect, isProvider } = require("../../middlewares/authMiddleware");

// --- Provider Core Endpoints ---
router.get("/provider-bookings", protect, isProvider, getProviderBookings);
router.put("/provider-bookings/:id/respond", protect, isProvider, respondToBookingRequest);
router.put("/provider-bookings/:id/status", protect, isProvider, updateJobExecutionStatus);

module.exports = router;
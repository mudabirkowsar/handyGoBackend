// routes/provider/providerRoutes.js

const express = require("express");

const router = express.Router();

const {
    updateProviderProfile,
    updateAvailabilityStatus,
    updateLocation,
    getMyProfile,
    getAllProviders,
    getSingleProvider,
    getNearbyProviders,
} = require("../../controllers/provider/providerController");

const {protect} = require("../../middlewares/authMiddleware");

const upload = require("../../middlewares/uploadMiddleware");

// =====================================================
// PROVIDER PROFILE
// =====================================================

router.get(
    "/me",
    protect,
    getMyProfile
);

router.put(
    "/update-profile",
    protect,
    upload.single("profileImage"),
    updateProviderProfile
);

router.put(
    "/update-location",
    protect,
    updateLocation
);

router.put(
    "/update-availability",
    protect,
    updateAvailabilityStatus
);

// =====================================================
// USER SIDE
// =====================================================

router.get(
    "/all",
    getAllProviders
);

router.get(
    "/nearby",
    getNearbyProviders
);

router.get(
    "/:providerId",
    getSingleProvider
);


module.exports = router;
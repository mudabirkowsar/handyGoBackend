// routes/provider/providerRoutes.js

const express = require("express");

const router = express.Router();

const {
    getMyProfile,
    updateProviderProfile,
    updateAvailabilityStatus,
    updateLocation,
    getMyOwnedReviews,
} = require("../../controllers/provider/providerController");

const { protect } = require("../../middlewares/authMiddleware");

const upload = require("../../middlewares/uploadMiddleware");

// =====================================================
// PROVIDER PROFILE
// =====================================================

router.get("/me", protect, getMyProfile);
router.put("/update-profile", protect, upload.single("profileImage"), updateProviderProfile);
router.put("/update-location", protect, updateLocation);
router.put("/update-availability", protect, updateAvailabilityStatus);
router.get("/my-reviews", protect, getMyOwnedReviews);



module.exports = router;
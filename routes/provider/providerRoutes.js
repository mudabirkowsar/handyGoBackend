// routes/provider/providerRoutes.js

const express = require("express");

const router = express.Router();

const {
    createService,
    getProviderServices,
    updateService,
    deleteService,
    updateProviderProfile,
    updateAvailabilityStatus,
    updateLocation,
    getMyProfile,
    getAllProviders,
    getSingleProvider,
    getNearbyProviders,
    getWorkingHours,
    updateWorkingHours,
    toggleDayAvailability
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
// SERVICES
// =====================================================

router.post(
    "/create-service",
    protect,
    upload.single("image"),
    createService
);

router.get(
    "/my-services",
    protect,
    getProviderServices
);

router.put(
    "/update-service/:serviceId",
    protect,
    upload.single("image"),
    updateService
);

router.delete(
    "/delete-service/:serviceId",
    protect,
    deleteService
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

router.route("/working-hours")
  .get(getWorkingHours)
  .put(updateWorkingHours);

router.patch("/working-hours/toggle-day", toggleDayAvailability);

module.exports = router;
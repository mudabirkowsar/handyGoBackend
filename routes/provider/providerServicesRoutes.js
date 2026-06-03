// routes/providerServices.js

const express = require("express");
const router = express.Router();
const {
    getProviderServices,
    addService,
    updateService,
    deleteService,
    updateGlobalBaseRates,
} = require("../../controllers/provider/providerServiceController");

// Note: Replace "protect" and "restrictTo" with your real auth and role verification middleware
const { protect, isProvider } = require("../../middlewares/authMiddleware");

// Enforce protection rules down down the line
router.use(protect);
router.use(isProvider);

// Routes managing itemized individual menus
router.route("/services")
    .get(getProviderServices)
    .post(addService);

router.route("/services/:serviceId")
    .put(updateService)
    .delete(deleteService);

// Route managing global system pricing defaults (Per day / Overtime hourly flat rates)
router.patch("/prices/base-rates", updateGlobalBaseRates);

module.exports = router;
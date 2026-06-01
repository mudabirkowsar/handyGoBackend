const express = require("express");
const router = express.Router();
const {
    getBusinessHours,
    updateAllBusinessHours,
    updateSingleDayHours,
    toggleDayStatus
} = require("../../controllers/company/companyHoursController");
const { protect, isCompany } = require("../../middlewares/authMiddleware"); // Adjust filename to match your platform setup

// Apply security shield block layer to all routes downstream
router.use(protect);
router.use(isCompany);

// Root weekly context adjustments
router.route("/")
    .get(getBusinessHours)
    .put(updateAllBusinessHours);

// Targeted element parameters adjustment loops
router.route("/:day")
    .patch(updateSingleDayHours);

router.route("/:day/toggle")
    .patch(toggleDayStatus);

module.exports = router;
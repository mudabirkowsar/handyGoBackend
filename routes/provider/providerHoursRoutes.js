const express = require("express");
const router = express.Router();
const {
  getWorkingHours,
  updateWorkingHours,
  updateOvertimeSettings,
} = require("../../controllers/provider/providerHoursController");

// Import your custom authorization middleware verifying JWT tokens
const { protect, isProvider } = require("../../middlewares/authMiddleware");

// All scheduling configurations route protection hooks
router.use(protect, isProvider);

// Core Schedule management mapping routes
router.route("/working-hours")
  .get(getWorkingHours)
  .put(updateWorkingHours);

router.route("/overtime")
  .put(updateOvertimeSettings);

module.exports = router;
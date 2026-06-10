const express = require("express");
const router = express.Router();
const { getAllCompanies, getCompanyDetails } = require("../../controllers/user/userCompanyController");

// Optional: If these endpoints require a logged-in user, import your middleware
// const { protect } = require("../middlewares/authMiddleware");

// Routes
router.route("/companies").get(getAllCompanies);
router.route("/companies/:id").get(getCompanyDetails);

module.exports = router;
const express = require("express");
const router = express.Router();
const { 
    getAllCompanies, 
    getCompanyDetails, 
    verifyCompany 
} = require("../../controllers/admin/companyController"); // Path relative to your folder setup

const { protect, isAdmin } = require("../../middlewares/authMiddleware");

// Apply authentication and admin guards to all routes down below
router.use(protect);
router.use(isAdmin);

// Route for getting companies (can pass query ?status=pending)
router.route("/companies")
    .get(getAllCompanies);

// Routes for specific company operations
router.route("/companies/:id")
    .get(getCompanyDetails);

router.route("/companies/:id/verify")
    .put(verifyCompany);

module.exports = router;
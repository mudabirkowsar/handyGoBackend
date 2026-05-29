// routes/company/companyRoutes.js

const express = require("express");

const router = express.Router();

const { protect } = require("../../middlewares/authMiddleware");

const upload = require("../../middlewares/uploadMiddleware");

const {
    getMyCompanyProfile,
    updateCompanyProfile,
    getAllCompanies,
    getSingleCompany,
} = require("../../controllers/company/companyController");

router.get("/me", protect, getMyCompanyProfile
);

router.put("/update-profile", protect, upload.fields([
    {
        name: "companyLogo",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    },
]),
    updateCompanyProfile
);

router.get("/all", getAllCompanies);

router.get("/:companyId", getSingleCompany);

module.exports = router;
// routes/company/companyRoutes.js

const express = require("express");

const router = express.Router();

const { protect } = require("../../middlewares/authMiddleware");

const upload = require("../../middlewares/uploadMiddleware");

const {
    getMyCompanyProfile,
    updateCompanyProfile,
    getAllCompanies,
    getSingleCompany,updateCompanyLocation
} = require("../../controllers/company/companyController");

router.get("/me", protect, getMyCompanyProfile
);

// Define upload configurations matching the schema fields
const profileFields = [
    { name: 'companyLogo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'insuranceDocument', maxCount: 1 },
    { name: 'ownerIdProof', maxCount: 1 },
    { name: 'companyPhotos', maxCount: 10 },
    { name: 'portfolioImages', maxCount: 10 },
    { name: 'completedProjectImages', maxCount: 10 }
];

router.put("/update-profile",protect, upload.fields(profileFields), updateCompanyProfile);

router.get("/all", getAllCompanies);

router.get("/:companyId", getSingleCompany);

module.exports = router;
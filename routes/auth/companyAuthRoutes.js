const express = require("express");
const router = express.Router();

// Middlewares
const { isCompany, protect } = require("../../middlewares/authMiddleware"); // Your JWT validator
const upload = require("../../middlewares/uploadMiddleware"); // Your Cloudinary/Multer configuration

// Controllers
const {
    registerCompany,
    uploadDocuments,
    updateCompanyProfile,
    loginCompany
} = require("../../controllers/auth/companyAuthController");

// 1. Configure the expected fields for files array matching your frontend keys
const documentUploadFields = upload.fields([
    { name: "gstCertificate", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
    { name: "insuranceDocument", maxCount: 1 },
    { name: "ownerIdProof", maxCount: 1 }
]);

// Public authentication flows
router.post("/register", registerCompany);
router.post("/login", loginCompany);

// Protected flows
// FIX: Injected 'documentUploadFields' middleware right after 'isCompany' validation
router.put("/upload-documents", protect, isCompany, documentUploadFields, uploadDocuments);
router.put("/update-profile", protect, isCompany, updateCompanyProfile);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
    registerProvider,
    loginProvider,
    uploadProviderDocuments,
} = require("../../controllers/auth/providerAuthController");

// Middlewares (Assuming you have these)
const { protect, isProvider } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

// Public Routes
router.post("/register", registerProvider);
router.post("/login", loginProvider);

// Protected Routes (Require Token)
router.post("/upload-documents", protect, isProvider, upload.fields([
    { name: 'aadhaarFrontImage', maxCount: 1 },
    { name: 'aadhaarBackImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 }
]),
    uploadProviderDocuments
);

module.exports = router;
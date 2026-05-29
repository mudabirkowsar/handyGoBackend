const express = require("express");
const router = express.Router();
const {
    getAllProviders,
    getProviderById,
    verifyProvider,
} = require("../../controllers/admin/adminProviderController");

// Middlewares (Assuming you have an Admin Protect middleware)
const { protect, isAdmin } = require("../../middlewares/authMiddleware");

// All routes here should be protected and restricted to Admin
router.use(protect);
router.use(isAdmin);

// Fetch list of providers (can pass ?status=pending)
router.get("/list", getAllProviders);

// Fetch specific provider documents and details
router.get("/details/:id", getProviderById);

// Verify (Approve/Reject) a provider
router.patch("/verify/:id", verifyProvider);

module.exports = router;
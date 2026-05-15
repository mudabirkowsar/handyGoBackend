// routes/auth/providerAuthRoutes.js

const express = require("express");

const router = express.Router();
const {protect} = require("../../middlewares/authMiddleware");

const upload = require("../../middlewares/uploadMiddleware");
const {
    registerProvider,
    loginProvider
} = require("../../controllers/auth/providerAuthController");

router.post("/register", registerProvider);

router.post("/login", loginProvider);
// router.put(
//     "/update-profile", protect,
//     upload.fields([
//         { name: "profileImage", maxCount: 1 },
//         { name: "portfolioImages", maxCount: 10 }
//     ]),
//     updateProviderProfile
// );

// router.get("/me", protect, getMyProfile);

module.exports = router;
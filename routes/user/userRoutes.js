const express = require("express");
const router = express.Router();
const { 
    getUserProfile, 
    updateProfile, 
    updatePreferences,
    addDeviceToken,
    deleteAccount 
} = require("../../controllers/user/userController");

// Import your auth middleware seen in image_782c50.png
const { protect } = require("../../middlewares/authMiddleware");

// All user routes are protected
router.use(protect);

router.get("/profile", getUserProfile);
router.patch("/profile", updateProfile);
router.patch("/preferences", updatePreferences);
router.post("/device-token", addDeviceToken);
router.delete("/account", deleteAccount);

module.exports = router;
// routes/addressRoutes.js
const express = require("express");
const router = express.Router();

// Import your custom JWT authentication middleware here
const { protect } = require("../../middlewares/authMiddleware"); 

// Import controller methods
const {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress
} = require("../../controllers/user/addressController");

// Secure all address management paths
router.route("/")
    .post(protect, addAddress)
    .get(protect, getAddresses);

router.route("/:id")
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

module.exports = router;
// routes/userBookingRoutes.js
const express = require("express");
const router = express.Router();

// Import your custom controllers
const { initiateSplitPayment, verifyAndCompleteBookingPayment } = require("../../controllers/payment/paymentController");
const { protect } = require("../../middlewares/authMiddleware"); // Security guard middleware

router.post("/pay-order/:id", protect, initiateSplitPayment);
router.post("/verify-payment/:id", protect, verifyAndCompleteBookingPayment);

module.exports = router;
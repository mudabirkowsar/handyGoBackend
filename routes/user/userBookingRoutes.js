const express = require("express");
const router = express.Router();

const { checkoutBooking, getUserBookings, cancelBookingByUser, completeBookingByUser } = require("../../controllers/user/userBookingController");

// Import your auth token middleware layers
const { protect } = require("../../middlewares/authMiddleware");

// --- User Core Endpoints ---
router.post("/user-bookings", protect, checkoutBooking);
router.get("/user-bookings", protect, getUserBookings);
router.put("/cancel/:id", protect, cancelBookingByUser);
router.put("/complete/:id", protect, completeBookingByUser);


module.exports = router;
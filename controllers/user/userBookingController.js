const Booking = require("../../models/Booking");
const Provider = require("../../models/Provider");
const Address = require("../../models/Address");
const Review = require("../../models/Review");

// @desc     Create / Checkout a new booking request
// @route    POST /api/user-bookings
// @access   Private (User)
exports.checkoutBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      providerId,
      addressId,
      bookingDate,
      startTime,
      durationDays,
      overtimeHours,
      paymentMethod,
      notes,
    } = req.body;

    // 1. Fetch provider details to verify live pricing
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found." });
    }

    // 2. Fetch user address card and extract structural data
    const savedAddress = await Address.findOne({ _id: addressId, user: userId });
    if (!savedAddress) {
      return res.status(404).json({ success: false, message: "Valid delivery address not found." });
    }

    // 3. Match calculations with schema logic
    const baseDays = durationDays || 1;
    const basePrice = provider.perDayPrice * baseDays;

    let overtimeTotal = 0;
    if (overtimeHours && overtimeHours > 0) {
      overtimeTotal = (provider.overtimeHourlyPrice || 0) * overtimeHours;
    }

    const platformFee = 50;
    const grandTotal = basePrice + overtimeTotal + platformFee;

    // 4. Formulate payload based explicitly on modified model variables
    const bookingData = {
      user: userId,
      provider: providerId,
      address: {
        houseNumber: savedAddress.houseNumber || "",
        street: savedAddress.streetAddress,
        phone: savedAddress.phone || req.user.phone || "1234567890", // Ensures fallback mapping compatibility
        landmark: savedAddress.landmark || "",
        city: savedAddress.city,
        state: savedAddress.state,
        postalCode: savedAddress.pincode,
        country: savedAddress.country || "India",
        deliveryInstructions: savedAddress.deliveryInstructions || notes || "",
      },
      schedule: {
        bookingDate,
        startTime,
        durationDays: baseDays,
        requiresOvertime: overtimeHours > 0,
        overtimeHours: overtimeHours || 0,
      },
      pricing: {
        basePrice: provider.perDayPrice,
        overtimeTotal,
        platformFee,
        grandTotal,
      },
      payment: {
        method: paymentMethod,
        status: "pending",
        transactionId: paymentMethod === "COD" ? `COD-${Date.now()}` : "",
      },
      bookingStatus: "requested",
      notes,
    };

    const newBooking = new Booking(bookingData);
    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking requested successfully!",
      data: savedBooking,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server Error during checkout", error: error.message });
  }
};

// @desc     Get all bookings made by the current logged-in user
// @route    GET /api/user-bookings
// @access   Private (User)
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate("provider", "fullName profileImage phone serviceProvided")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch user bookings", error: error.message });
  }
};

// @desc     Cancel a pending booking request by User
// @route    PUT /api/user-bookings/:id/cancel
// @access   Private (User)
exports.cancelBookingByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { reason } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking record not found." });
    }

    if (["completed", "cancelled", "ongoing"].includes(booking.bookingStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an ${booking.bookingStatus} booking.` });
    }

    booking.bookingStatus = "cancelled";
    booking.cancellation = {
      cancelledBy: "user",
      reason: reason || "Cancelled by user via dashboard",
      cancelledAt: new Date(),
    };

    await booking.save();
    res.status(200).json({ success: true, message: "Booking cancelled successfully", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating cancellation", error: error.message });
  }
};

// @desc     Mark an ongoing job as completed (User confirmation)
// @route    PUT /api/user-bookings/:id/complete
// @access   Private (User)
exports.completeBookingByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    // Find the booking belonging to this logged-in user
    const booking = await Booking.findOne({ _id: bookingId, user: userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking record not found or unauthorized access."
      });
    }

    // Strict State Machine Guard: The user can ONLY complete a job if it is currently 'ongoing'
    if (booking.bookingStatus !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: `Cannot mark as completed. Job is currently '${booking.bookingStatus}', not 'ongoing'.`
      });
    }

    // Advance the lifecycle state
    booking.bookingStatus = "completed";

    // Financial Reconciliation Logic for COD
    if (booking.payment.method === "COD") {
      booking.payment.status = "paid";
      booking.payment.paidAt = new Date();
    }

    // Persist to MongoDB
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Thank you! You have successfully confirmed job completion.",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not process job completion state updates.",
      error: error.message
    });
  }
};

// controllers/bookingController.js
exports.createBookingReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { rating, comment } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking record not found." });
    }

    if (booking.bookingStatus !== "completed") {
      return res.status(400).json({ success: false, message: "You can only review completed jobs." });
    }

    // Save the review record
    const review = await Review.create({
      booking: bookingId,
      user: userId,
      provider: booking.provider,
      rating: Number(rating),
      comment: comment || "",
    });

    // =========================================================================
    // CRITICAL FIX: Flip the database token switch and save it to MongoDB
    // =========================================================================
    booking.isReviewed = true;
    await booking.save();

    res.status(201).json({
      success: true,
      message: "Review shared successfully! Thank you for your feedback.",
      data: review,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error updating review data", error: error.message });
  }
};
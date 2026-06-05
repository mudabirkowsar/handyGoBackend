const Booking = require("../../models/Booking");

// @desc     Get all bookings requested/assigned to the logged-in Provider
// @route    GET /api/provider-bookings
// @access   Private (Provider)
exports.getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user.id;
    
    const filterQuery = { provider: providerId };
    if (req.query.status) {
      filterQuery.bookingStatus = req.query.status;
    }

    const bookings = await Booking.find(filterQuery)
      .populate("user", "fullName phone profileImage email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch provider bookings", error: error.message });
  }
};

// @desc     Accept or Reject a incoming user booking request
// @route    PUT /api/provider-bookings/:id/respond
// @access   Private (Provider)
exports.respondToBookingRequest = async (req, res) => {
  try {
    const providerId = req.user.id;
    const bookingId = req.params.id;
    const { action, rejectionReason } = req.body; // Expects 'accepted' or 'rejected'

    if (!["accepted", "rejected"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action type. Expected 'accepted' or 'rejected'." });
    }

    const booking = await Booking.findOne({ _id: bookingId, provider: providerId });

    if (!booking) {
      return res.status(404).json({ success: false, message: "No assignment found mapping these parameters." });
    }

    if (booking.bookingStatus !== "requested") {
      return res.status(400).json({ success: false, message: `Request already handled. Status is ${booking.bookingStatus}` });
    }

    booking.bookingStatus = action;

    if (action === "rejected") {
      booking.cancellation = {
        cancelledBy: "provider",
        reason: rejectionReason || "Rejected due to scheduling conflicts.",
        cancelledAt: new Date(),
      };
    }

    await booking.save();
    res.status(200).json({ success: true, message: `Booking request successfully ${action}`, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error executing action updates", error: error.message });
  }
};

// @desc     Update ongoing status to 'ongoing' or 'completed'
// @route    PUT /api/provider-bookings/:id/status
// @access   Private (Provider)
exports.updateJobExecutionStatus = async (req, res) => {
  try {
    const providerId = req.user.id;
    const bookingId = req.params.id;
    const { status } = req.body; // Expects 'ongoing' or 'completed'

    if (!["ongoing", "completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid workflow lifecycle transition status." });
    }

    const booking = await Booking.findOne({ _id: bookingId, provider: providerId });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking record allocation parameters failed." });
    }

    if (status === "ongoing" && booking.bookingStatus !== "accepted") {
      return res.status(400).json({ success: false, message: "You must accept the booking before starting the job." });
    }
    if (status === "completed" && booking.bookingStatus !== "ongoing") {
      return res.status(400).json({ success: false, message: "Job must be marked ongoing before it can be completed." });
    }

    booking.bookingStatus = status;

    if (status === "completed") {
      if (booking.payment.method === "COD") {
        booking.payment.status = "paid";
        booking.payment.paidAt = new Date();
      }
    }

    await booking.save();
    res.status(200).json({ success: true, message: `Task progress updated to: ${status}`, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not alter execution state status", error: error.message });
  }
};
// controllers/paymentController.js
const Booking = require("../../models/Booking");
const Provider = require("../../models/Provider");
const Razorpay = require("razorpay"); // npm install razorpay
const crypto = require("crypto");
const mongoose = require("mongoose");

console.log(process.env.RAZORPAY_KEY_SECRET)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
exports.initiateSplitPayment = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate("provider");
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking record not found." });
        }

        const provider = booking.provider;
        const grandTotal = booking.pricing.grandTotal;

        const platformCommissionRate = provider.commissionPercentage || 10;
        const totalAmountInPaisa = grandTotal * 100;

        const platformCutInPaisa = (totalAmountInPaisa * platformCommissionRate) / 100;
        const providerPayoutInPaisa = totalAmountInPaisa - platformCutInPaisa;

        // =========================================================================
        // FIX: Extract Razorpay Merchant ID & Verify it meets the 18-character requirement
        // =========================================================================
        // We assume you store this in bankDetails.accountNumber or a dedicated field.
        // Razorpay account IDs are exactly 18 characters long and begin with "acc_"
        const razorpayAccountId = provider.bankDetails?.accountNumber || "";
        const isValidRazorpayAccount = /^acc_[a-zA-Z0-9]{14}$/.test(razorpayAccountId);

        const orderOptions = {
            amount: totalAmountInPaisa,
            currency: "INR",
            receipt: `receipt_booking_${booking._id}`,
        };

        // Only route splits if the account token passes validation strings cleanly
        if (isValidRazorpayAccount) {
            orderOptions.transfers = [
                {
                    account: razorpayAccountId, // e.g. "acc_Gv3hK1s9Yz5pQr" (18 chars)
                    amount: providerPayoutInPaisa,
                    currency: "INR",
                    notes: { info: `Net payout for booking: ${booking._id}` },
                    on_hold: false
                }
            ];
            console.log(`[Payment Engine] Initializing dynamic split transfer to connected account: ${razorpayAccountId}`);
        } else {
            // Safety Fallback: If no valid 18-char account token is mapped to the provider,
            // collect 100% of the funds to your primary dashboard balance.
            // You can manually disburse this later to their bank from your virtual wallet ledger.
            console.log(`[Payment Safety Fallback] Provider ${provider._id} missing valid 18-char Razorpay Account ID ("${razorpayAccountId}"). Collecting 100% to platform account.`);
        }

        const gatewayOrder = await razorpay.orders.create(orderOptions);

        res.status(200).json({
            success: true,
            message: "Split gateway payment instance initialized successfully",
            gatewayOrderId: gatewayOrder.id,
            amount: gatewayOrder.amount,
            currency: gatewayOrder.currency
        });

    } catch (error) {
        console.error("Payment setup exception summary:", error);
        res.status(500).json({ success: false, message: "Could not initialize payment pipeline.", error: error.message });
    }
};

exports.verifyAndCompleteBookingPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingId = req.params.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Basic incoming payload validation check
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required tracking parameters for transaction verification."
      });
    }

    // 2. Cryptographic signature verification (Security Guard against payload forgery)
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction verification failed. Fraudulent signature fingerprint detected." 
      });
    }

    // 3. Look up booking profile matching structural parameters
    const booking = await Booking.findById(bookingId).populate("provider").session(session);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Target booking profile not found." });
    }

    if (booking.bookingStatus === "completed") {
      return res.status(400).json({ success: false, message: "This booking transaction has already been closed out." });
    }

    // 4. Update booking fields to record payment state data snapshot
    booking.bookingStatus = "completed";
    booking.payment.status = "paid";
    booking.payment.transactionId = razorpay_payment_id;
    booking.payment.paidAt = new Date();

    // 5. Update Provider analytical metrics and wallet configurations internally
    const provider = booking.provider;
    const grandTotal = booking.pricing.grandTotal;
    const commissionRate = provider.commissionPercentage || 10;

    const platformProfit = (grandTotal * commissionRate) / 100;
    const providerNetEarnings = grandTotal - platformProfit;

    // Credit internal app ledger balances to provider
    provider.walletBalance += providerNetEarnings;
    provider.totalEarnings += providerNetEarnings;
    provider.completedBookings += 1;

    // Save both operational records inside the transaction sandbox boundary
    await booking.save({ session });
    await provider.save({ session });

    // Commit all changes atomically to MongoDB
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Payment successfully verified! Booking marked as completed.",
      data: booking
    });

  } catch (error) {
    // Roll back structural changes if anything errors mid-execution
    await session.abortTransaction();
    session.endSession();
    console.error("Payment settlement execution error stack:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error during final checkout processing.", 
      error: error.message 
    });
  }
};
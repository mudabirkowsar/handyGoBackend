const Provider = require("../../models/Provider");

// @desc    Get all providers with filters and pagination
// @route   GET /api/admin/providers
exports.getAllProviders = async (req, res) => {
  try {
    const { status, search, service, page = 1, limit = 10 } = req.query;

    const query = { isDeleted: false };

    // Filters
    if (status) query.verificationStatus = status;
    if (service) query.serviceProvided = new RegExp(service, "i");
    
    // Search by name, phone or email
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const providers = await Provider.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Provider.countDocuments(query);

    res.status(200).json({
      success: true,
      count: providers.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single provider details
// @route   GET /api/admin/providers/:id
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject Provider (Verification)
// @route   PATCH /api/admin/providers/:id/verify
exports.verifyProvider = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected", "incomplete"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updateData = {
      verificationStatus: status,
      rejectionReason: status === "rejected" ? rejectionReason : "",
      verifiedAt: status === "approved" ? Date.now() : null,
    };

    const provider = await Provider.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: `Provider status updated to ${status}`,
      data: provider,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block or Unblock Provider
// @route   PATCH /api/admin/providers/:id/block
exports.toggleBlockProvider = async (req, res) => {
  try {
    const { isBlocked, blockedReason } = req.body;

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { isBlocked, blockedReason: isBlocked ? blockedReason : "" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: isBlocked ? "Provider blocked" : "Provider unblocked",
      data: provider,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Provider Details (Admin Override)
// @route   PUT /api/admin/providers/:id
exports.updateProviderAdmin = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft Delete Provider
// @route   DELETE /api/admin/providers/:id
exports.deleteProvider = async (req, res) => {
  try {
    await Provider.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Provider deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Stats for Admin Dashboard
// @route   GET /api/admin/providers/stats/overview
exports.getProviderStats = async (req, res) => {
  try {
    const stats = await Provider.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$verificationStatus", "pending"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$verificationStatus", "approved"] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ["$isBlocked", true] }, 1, 0] } },
          totalEarnings: { $sum: "$totalEarnings" },
        },
      },
    ]);

    res.status(200).json({ success: true, data: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
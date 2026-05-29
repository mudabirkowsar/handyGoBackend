const Provider = require("../../models/Provider");

// ==========================================
// GET ALL PROVIDERS (With Status Filter)
// ==========================================
const getAllProviders = async (req, res) => {
    try {
        const { status } = req.query; // e.g., /admin/providers?status=pending
        const filter = status ? { verificationStatus: status } : {};

        const providers = await Provider.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: providers.length,
            providers,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// GET SINGLE PROVIDER DETAILS (For Review)
// ==========================================
const getProviderById = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        res.status(200).json({
            success: true,
            provider,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// VERIFY / UPDATE PROVIDER STATUS
// ==========================================
const verifyProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        // 1. Validate status input
        if (!["approved", "rejected", "incomplete"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Use approved, rejected, or incomplete.",
            });
        }

        // 2. Prepare update object
        const updateData = {
            verificationStatus: status,
        };

        if (status === "approved") {
            updateData.verifiedAt = Date.now();
            updateData.rejectionReason = null; // Clear any previous rejection
        }

        if (status === "rejected") {
            if (!rejectionReason) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a reason for rejection",
                });
            }
            updateData.rejectionReason = rejectionReason;
        }

        // 3. Update Provider
        const provider = await Provider.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        res.status(200).json({
            success: true,
            message: `Provider status updated to ${status}`,
            provider: {
                _id: provider._id,
                fullName: provider.fullName,
                verificationStatus: provider.verificationStatus,
                rejectionReason: provider.rejectionReason,
                verifiedAt: provider.verifiedAt,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllProviders,
    getProviderById,
    verifyProvider,
};
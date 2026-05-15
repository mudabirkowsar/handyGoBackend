const User = require("../../models/User");

// @desc    Get current user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PATCH /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        // Prevent manual updates to sensitive analytics or auth fields here
        delete updates.password;
        delete updates.role;
        delete updates.walletBalance;

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update notification preferences
// @route   PATCH /api/v1/users/preferences
// @access  Private
const updatePreferences = async (req, res) => {
    try {
        const { notificationPreferences, appSettings } = req.body;
        const user = await User.findById(req.user._id);

        if (notificationPreferences) user.notificationPreferences = notificationPreferences;
        if (appSettings) user.appSettings = appSettings;

        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Add a device token for push notifications
// @route   POST /api/v1/users/device-token
// @access  Private
const addDeviceToken = async (req, res) => {
    try {
        const { token } = req.body;
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { deviceTokens: token }
        });
        res.status(200).json({ success: true, message: "Token added" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Soft delete account
// @route   DELETE /api/v1/users/account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            isDeleted: true,
            isBlocked: true,
            blockedReason: "Account deletion requested by user"
        });
        res.status(200).json({ success: true, message: "Account scheduled for deletion" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateProfile,
    updatePreferences,
    addDeviceToken,
    deleteAccount
};
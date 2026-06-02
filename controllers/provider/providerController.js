// controllers/provider/providerController.js

const Provider = require("../../models/Provider");

// =====================================================
// UPDATE PROVIDER PROFILE
// =====================================================
const updateProviderProfile = async (req, res) => {
    try {

        const provider = await Provider.findById(
            req.user.id
        );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        provider.fullName =
            req.body.fullName ||
            provider.fullName;

        provider.bio =
            req.body.bio ||
            provider.bio;

        provider.gender =
            req.body.gender ||
            provider.gender;

        provider.languages =
            req.body.languages ||
            provider.languages;

        provider.experienceYears =
            req.body.experienceYears ||
            provider.experienceYears;

        provider.skills =
            req.body.skills ||
            provider.skills;

        if (req.file) {
            provider.profileImage =
                req.file.path;
        }

        await provider.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            provider,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// UPDATE AVAILABILITY STATUS
// =====================================================
const updateAvailabilityStatus = async (req, res) => {
    try {

        const {
            isOnline,
            availabilityStatus,
        } = req.body;

        const provider = await Provider.findById(
            req.user.id
        );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        provider.isOnline = isOnline;

        provider.availabilityStatus =
            availabilityStatus;

        await provider.save();

        res.status(200).json({
            success: true,
            message:
                "Availability updated successfully",
            provider,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// UPDATE LOCATION
// =====================================================
const updateLocation = async (req, res) => {
    try {

        const {
            lat,
            lng,
        } = req.body;

        const provider = await Provider.findById(
            req.user.id
        );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        provider.currentLocation = {
            lat,
            lng,
            updatedAt: new Date(),
        };

        provider.location = {
            type: "Point",
            coordinates: [lng, lat],
        };

        await provider.save();

        res.status(200).json({
            success: true,
            message:
                "Location updated successfully",
            location: provider.location,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET MY PROFILE
// =====================================================
const getMyProfile = async (req, res) => {
    try {

        const provider = await Provider.findById(
            req.user.id
        )
            .select("-password");

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        res.status(200).json({
            success: true,
            provider,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET ALL PROVIDERS
// =====================================================
const getAllProviders = async (req, res) => {
    try {

        const providers = await Provider.find({
            isBlocked: false,
            isDeleted: false,
            verificationStatus: "approved",
        })
            .select("-password");

        res.status(200).json({
            success: true,
            totalProviders: providers.length,
            providers,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET SINGLE PROVIDER
// =====================================================
const getSingleProvider = async (req, res) => {
    try {

        const provider = await Provider.findById(
            req.params.providerId
        )
            .select("-password");

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        res.status(200).json({
            success: true,
            provider,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET NEARBY PROVIDERS
// =====================================================
const getNearbyProviders = async (req, res) => {
    try {

        const {
            lng,
            lat,
            radius = 10,
        } = req.query;

        const providers = await Provider.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(lng),
                            parseFloat(lat),
                        ],
                    },
                    $maxDistance:
                        radius * 1000,
                },
            },

            verificationStatus:
                "approved",

            isBlocked: false,

            isDeleted: false,
        })
            .select("-password");

        res.status(200).json({
            success: true,
            totalProviders:
                providers.length,
            providers,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

module.exports = {
    updateProviderProfile,
    updateAvailabilityStatus,
    updateLocation,
    getMyProfile,
    getAllProviders,
    getSingleProvider,
    getNearbyProviders,
};
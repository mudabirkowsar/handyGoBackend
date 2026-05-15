// controllers/provider/providerController.js

const Provider = require("../../models/Provider");

// =====================================================
// CREATE SERVICE
// =====================================================
const createService = async (req, res) => {
    try {

        const providerId = req.user.id;

        const {
            title,
            description,
            price,
            pricingType,
            estimatedDurationMinutes,
        } = req.body;

        const provider = await Provider.findById(providerId);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        const image = req.file
            ? req.file.path
            : "";

        provider.services.push({
            title,
            description,
            image,
            price,
            pricingType,
            estimatedDurationMinutes,
        });

        await provider.save();

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            services: provider.services,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET PROVIDER SERVICES
// =====================================================
const getProviderServices = async (req, res) => {
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

        res.status(200).json({
            success: true,
            services: provider.services,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// UPDATE SERVICE
// =====================================================
const updateService = async (req, res) => {
    try {

        const { serviceId } = req.params;

        const provider = await Provider.findById(
            req.user.id
        );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        const service = provider.services.id(
            serviceId
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        service.title =
            req.body.title || service.title;

        service.description =
            req.body.description ||
            service.description;

        service.price =
            req.body.price || service.price;

        service.pricingType =
            req.body.pricingType ||
            service.pricingType;

        service.estimatedDurationMinutes =
            req.body.estimatedDurationMinutes ||
            service.estimatedDurationMinutes;

        service.isActive =
            req.body.isActive ??
            service.isActive;

        if (req.file) {
            service.image = req.file.path;
        }

        await provider.save();

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            service,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// DELETE SERVICE
// =====================================================
const deleteService = async (req, res) => {
    try {

        const { serviceId } = req.params;

        const provider = await Provider.findById(
            req.user.id
        );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        const service = provider.services.id(
            serviceId
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        service.deleteOne();

        await provider.save();

        res.status(200).json({
            success: true,
            message: "Service deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

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
            .populate("serviceCategory")
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
            .populate("serviceCategory")
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
            .populate("serviceCategory")
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
            .populate("serviceCategory")
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
    createService,
    getProviderServices,
    updateService,
    deleteService,
    updateProviderProfile,
    updateAvailabilityStatus,
    updateLocation,
    getMyProfile,
    getAllProviders,
    getSingleProvider,
    getNearbyProviders,
};
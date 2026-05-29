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

/**
 * @desc    Get current provider's working hours configuration
 * @route   GET /api/v1/providers/working-hours
 * @access  Private (Provider Only)
 */
const getWorkingHours = async (req, res) => {
  try {
    // Assuming authentication middleware attaches the logged-in provider's data to req.user
    const providerId = req.user._id;

    const provider = await Provider.findById(providerId).select("workingHours");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: provider.workingHours,
    });
  } catch (error) {
    console.error("Error in getWorkingHours:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching schedule.",
    });
  }
};

/**
 * @desc    Update or initialize working hours for a provider
 * @route   PUT /api/v1/providers/working-hours
 * @access  Private (Provider Only)
 */
const updateWorkingHours = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { workingHours } = req.body;

    if (!workingHours) {
      return res.status(400).json({
        success: false,
        message: "Missing workingHours configuration data payload.",
      });
    }

    // List of expected keys matching the Mongoose schema path
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Simple structural validation to match schema requirements
    for (const day of validDays) {
      if (workingHours[day]) {
        const { isAvailable, start, end } = workingHours[day];
        
        // If a day is marked active, ensure it contains standard timeline boundaries
        if (isAvailable && (!start || !end)) {
          return res.status(400).json({
            success: false,
            message: `Active operational days require valid start and end times. Error at: ${day}`,
          });
        }
      }
    }

    // Construct precise dot-notation object update block to avoid overwriting unrelated profile fields
    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      { $set: { workingHours: workingHours } },
      { new: true, runValidators: true }
    ).select("workingHours");

    return res.status(200).json({
      success: true,
      message: "Working hours schedule configuration saved successfully.",
      data: updatedProvider.workingHours,
    });
  } catch (error) {
    console.error("Error in updateWorkingHours:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update configuration settings on the server.",
    });
  }
};

/**
 * @desc    Quick switch alternative to toggle a single day's status instantly
 * @route   PATCH /api/v1/providers/working-hours/toggle-day
 * @access  Private (Provider Only)
 */
const toggleDayAvailability = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { day, isAvailable } = req.body;

    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    if (!validDays.includes(day?.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid target day parameter received.",
      });
    }

    // Explicitly update only the targeting day's boolean context flags
    const updateQuery = {};
    updateQuery[`workingHours.${day.toLowerCase()}.isAvailable`] = Boolean(isAvailable);

    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      { $set: updateQuery },
      { new: true }
    ).select("workingHours");

    return res.status(200).json({
      success: true,
      message: `Successfully altered ${day} availability configuration state.`,
      data: updatedProvider.workingHours[day.toLowerCase()],
    });
  } catch (error) {
    console.error("Error in toggleDayAvailability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to parse single day modification criteria parameters.",
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
    getWorkingHours,
    updateWorkingHours,
    toggleDayAvailability
};
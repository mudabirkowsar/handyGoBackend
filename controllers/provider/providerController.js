// controllers/provider/providerController.js

const Provider = require("../../models/Provider");

// =====================================================
// GET MY PROFILE
// =====================================================
const getMyProfile = async (req, res) => {
    try {

        const provider = await Provider.findById(
            req.user.id
        )
            .select("-password -workingHours -refreshToken -deviceTokens");

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
// UPDATE PROVIDER PROFILE
// =====================================================
const updateProviderProfile = async (req, res) => {
    try {
        const providerId = req.user._id; // Populated from your auth verification middleware

        // 1. Explicitly destructure allowed fields directly from req.body
        const {
            fullName,
            bio,
            gender,
            dateOfBirth,
            languages,
            experienceYears,
            skills,
            serviceProvided,
            address,
            bankDetails,
            notificationPreferences,
            profileImage
        } = req.body;

        // 2. Construct a flat update payload object using MongoDB dot-notation
        const updateData = {};

        // Top-level primitive fields validation and assignment
        if (fullName !== undefined) updateData.fullName = fullName.trim();
        if (bio !== undefined) updateData.bio = bio;
        if (gender !== undefined) updateData.gender = gender;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (experienceYears !== undefined) updateData.experienceYears = Number(experienceYears);
        if (serviceProvided !== undefined) updateData.serviceProvided = serviceProvided;
        if (profileImage !== undefined) updateData.profileImage = profileImage;

        // Array conversions (Safeguarded against parsing null or undefined values)
        if (Array.isArray(languages)) updateData.languages = languages;
        if (Array.isArray(skills)) updateData.skills = skills;

        // Nested Structure 1: Address Object (Safely targets keys dynamically)
        if (address && typeof address === "object") {
            Object.keys(address).forEach((key) => {
                updateData[`address.${key}`] = address[key];
            });
        }

        // Nested Structure 2: Bank Details Object
        if (bankDetails && typeof bankDetails === "object") {
            Object.keys(bankDetails).forEach((key) => {
                updateData[`bankDetails.${key}`] = bankDetails[key];
            });
        }

        // Nested Structure 3: Notification Preferences Object
        if (notificationPreferences && typeof notificationPreferences === "object") {
            Object.keys(notificationPreferences).forEach((key) => {
                updateData[`notificationPreferences.${key}`] = notificationPreferences[key];
            });
        }

        // 3. Prevent structural mutations by stripping security-sensitive variables
        const structuralGuardrails = [
            "role", "verificationStatus", "isBlocked", "walletBalance", 
            "totalEarnings", "tokens", "password", "email", "phone"
        ];
        
        structuralGuardrails.forEach(field => {
            if (req.body[field] !== undefined) {
                delete req.body[field];
            }
        });

        // 4. Fire the update tracking document directly to MongoDB
        const updatedProvider = await Provider.findByIdAndUpdate(
            providerId,
            { $set: updateData },
            { 
                new: true,            // Returns the newly updated object from the database
                runValidators: true   // Forces validation checks against your schema enum arrays
            }
        ).select("-password -tokens -refreshToken"); // Omit sensitive data tokens from output

        if (!updatedProvider) {
            return res.status(404).json({
                success: false,
                message: "Provider profile record not found.",
            });
        }

        // 5. Send back full update payload data confirmation
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            provider: updatedProvider,
        });

    } catch (error) {
        console.error("Critical error in updateProviderProfile controller:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error: Unable to modify operational profile metrics.",
            error: error.message,
        });
    }
};
// =====================================================
// UPDATE AVAILABILITY STATUS
// =====================================================
const updateAvailabilityStatus = async (req, res) => {
    try {
        const providerId = req.user._id; // Extracted from auth middleware
        const { availabilityStatus } = req.body;

        // 1. Validate status input parameters matching your enum options
        const validStatuses = ["available", "busy", "offline"];
        if (!availabilityStatus || !validStatuses.includes(availabilityStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status parameter. Choose from: ${validStatuses.join(", ")}.`
            });
        }

        // 2. Intelligently compute the companion 'isOnline' boolean state flag
        // If they are marked "offline", isOnline should logically be false. Otherwise, true.
        const isOnline = availabilityStatus !== "offline";

        // 3. Commit status changes directly to the target MongoDB provider document
        const updatedProvider = await Provider.findByIdAndUpdate(
            providerId,
            {
                $set: {
                    availabilityStatus,
                    isOnline,
                    lastSeenAt: new Date()
                }
            },
            { new: true, runValidators: true }
        ).select("availabilityStatus isOnline fullName lastSeenAt");

        if (!updatedProvider) {
            return res.status(404).json({
                success: false,
                message: "Provider profile not found."
            });
        }

        // 4. Return the synchronized status state back to your client layout engine
        return res.status(200).json({
            success: true,
            message: `Availability status updated to ${availabilityStatus}.`,
            availability: {
                status: updatedProvider.availabilityStatus,
                isOnline: updatedProvider.isOnline,
                lastSeenAt: updatedProvider.lastSeenAt
            }
        });

    } catch (error) {
        console.error("Error inside updateProviderAvailability controller:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error: Failure adjusting live availability parameters.",
            error: error.message
        });
    }
};
// =====================================================
// UPDATE LOCATION
// =====================================================
const updateLocation = async (req, res) => {
    try {
        const providerId = req.user._id; // Extracted from auth middleware
        const { latitude, longitude } = req.body;

        // 1. Basic validation checklist
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide both latitude and longitude values."
            });
        }

        // Validate coordinate bounds ranges
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid coordinates format bounds. Latitude must be between -90/90, Longitude between -180/180."
            });
        }

        // 2. Format update payload mapping onto both schema location structures
        const locationUpdate = {
            // MongoDB GeoJSON format requires: [longitude, latitude] orientation ordering
            "location.type": "Point",
            "location.coordinates": [Number(longitude), Number(latitude)],

            // Flat object tracking coordinates structure format
            "currentLocation.lat": Number(latitude),
            "currentLocation.lng": Number(longitude),
            "currentLocation.updatedAt": new Date()
        };

        // 3. Update coordinates in database
        const updatedProvider = await Provider.findByIdAndUpdate(
            providerId,
            { $set: locationUpdate },
            { new: true, runValidators: true }
        ).select("location currentLocation fullName isOnline");

        if (!updatedProvider) {
            return res.status(404).json({
                success: false,
                message: "Provider record profile could not be verified."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Provider location metrics synced successfully.",
            coordinates: {
                latitude: updatedProvider.currentLocation.lat,
                longitude: updatedProvider.currentLocation.lng,
                updatedAt: updatedProvider.currentLocation.updatedAt
            }
        });

    } catch (error) {
        console.error("Error inside updateProviderLocation controller:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error: Failure writing tracking coordinates down.",
            error: error.message
        });
    }
};


module.exports = {
    updateProviderProfile,
    updateAvailabilityStatus,
    updateLocation,
    getMyProfile,
};
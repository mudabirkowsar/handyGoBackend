// controllers/provider/providerController.js

const Provider = require("../../models/Provider");
const Review = require("../../models/Review");

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
        const providerId = req.user._id;
        const updateData = {};

        // --- 1. RECONSTRUCT NESTED OBJECTS FROM FORM-DATA ---
        const processedBody = {};

        Object.keys(req.body).forEach((key) => {
            // Handle Nested Objects (e.g., address.city)
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                if (!processedBody[parent]) processedBody[parent] = {};
                processedBody[parent][child] = req.body[key];
            } 
            // Handle Arrays (e.g., skills[])
            else if (key.endsWith('[]')) {
                const cleanKey = key.replace('[]', '');
                if (!processedBody[cleanKey]) processedBody[cleanKey] = [];
                if (Array.isArray(req.body[key])) {
                    processedBody[cleanKey] = req.body[key];
                } else {
                    processedBody[cleanKey].push(req.body[key]);
                }
            } 
            // Handle Normal Fields
            else {
                processedBody[key] = req.body[key];
            }
        });

        // --- 2. MAP TO MONGODB UPDATE OBJECT ---
        
        // Primitive fields
        if (processedBody.fullName) updateData.fullName = processedBody.fullName.trim();
        if (processedBody.bio) updateData.bio = processedBody.bio;
        if (processedBody.gender) updateData.gender = processedBody.gender;
        if (processedBody.dateOfBirth) updateData.dateOfBirth = processedBody.dateOfBirth;
        if (processedBody.experienceYears) updateData.experienceYears = Number(processedBody.experienceYears);
        if (processedBody.serviceProvided) updateData.serviceProvided = processedBody.serviceProvided;

        // Arrays
        if (processedBody.languages) updateData.languages = processedBody.languages;
        if (processedBody.skills) updateData.skills = processedBody.skills;

        // --- 3. CLOUDINARY IMAGE HANDLING ---
        // If Multer successfully uploaded to Cloudinary, req.file.path exists
        if (req.file && req.file.path) {
            updateData.profileImage = req.file.path; 
        }

        // --- 4. NESTED STRUCTURES (Address, Bank, Notifications) ---
        // We use dot-notation for $set to avoid overwriting the entire sub-document
        const nestedSections = ['address', 'bankDetails', 'notificationPreferences'];
        
        nestedSections.forEach(section => {
            if (processedBody[section] && typeof processedBody[section] === 'object') {
                Object.keys(processedBody[section]).forEach(key => {
                    let value = processedBody[section][key];
                    
                    // Boolean conversion for notification toggles
                    if (value === "true") value = true;
                    if (value === "false") value = false;
                    
                    updateData[`${section}.${key}`] = (typeof value === 'string') ? value.trim() : value;
                });
            }
        });

        // --- 5. EXECUTE DATABASE UPDATE ---
        const updatedProvider = await Provider.findByIdAndUpdate(
            providerId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -tokens");

        if (!updatedProvider) {
            return res.status(404).json({ success: false, message: "Provider not found." });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            provider: updatedProvider
        });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, message: error.message });
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

const getMyOwnedReviews = async (req, res) => {
    try {
        // req.user.id is populated via your authentication validation middleware layer
        const providerId = req.user.id;

        // Optional pagination configuration boundaries to prevent large payload overloads
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        // Pull reviews targeting this provider, populate reviewer profile nodes, and paginate
        const reviews = await Review.find({ provider: providerId })
            .populate("user", "fullName profileImage")
            .select("rating comment createdAt booking")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Fetch absolute item depths for pagination calculations
        const totalReviewsCount = await Review.countDocuments({ provider: providerId });

        res.status(200).json({
            success: true,
            count: reviews.length,
            pagination: {
                totalItems: totalReviewsCount,
                currentPage: page,
                totalPages: Math.ceil(totalReviewsCount / limit),
                hasNextPage: skip + reviews.length < totalReviewsCount
            },
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not retrieve your feedback profile stream.",
            error: error.message
        });
    }
};



module.exports = {
    updateProviderProfile,
    updateAvailabilityStatus,
    updateLocation,
    getMyProfile,
    getMyOwnedReviews,
};
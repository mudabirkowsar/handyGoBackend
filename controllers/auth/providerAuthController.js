// controllers/auth/providerAuthController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Provider = require("../../models/Provider");

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );
};

const registerProvider = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            email,
            password,
            serviceCategory, // Added this
            lat,             // Added this
            lng              // Added this
        } = req.body;

        // Basic check for coordinates since they are required by your model
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: "Location coordinates (lat, lng) are required",
            });
        }

        const existingProvider = await Provider.findOne({ phone });

        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: "Provider already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const provider = await Provider.create({
            fullName,
            phone,
            email,
            password: hashedPassword,
            role: "provider",
            serviceCategory, // Pass the ID from req.body
            location: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)], // [longitude, latitude]
            },
        });

        res.status(201).json({
            success: true,
            message: "Provider registered successfully",
            token: generateToken(provider._id, provider.role),
            provider,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const loginProvider = async (
    req,
    res
) => {
    try {
        const { phone, password } = req.body;

        const provider = await Provider.findOne({
            phone,
        }).select("+password");

        if (!provider) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            provider.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: generateToken(
                provider._id,
                provider.role
            ),
            provider,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateProviderProfile = async (req, res) => {
    try {
        const providerId = req.user.id; // From authMiddleware
        const updates = req.body;

        // 1. Handle File Uploads (Cloudinary)
        if (req.files) {
            // Profile Image
            if (req.files.profileImage) {
                updates.profileImage = req.files.profileImage[0].path;
            }
            // Portfolio Images (Multiple)
            if (req.files.portfolioImages) {
                const portfolioUrls = req.files.portfolioImages.map(file => file.path);
                // Use $push if you want to add to existing, or just replace
                updates.portfolioImages = portfolioUrls;
            }
        }

        // 2. Handle Location (Parsing coordinates if sent as string)
        if (updates.lng && updates.lat) {
            updates.location = {
                type: "Point",
                coordinates: [parseFloat(updates.lng), parseFloat(updates.lat)],
            };
        }

        // 3. Handle Nested Objects (Working Hours / Services)
        // Note: If you send workingHours or services as JSON strings from frontend, 
        // you must JSON.parse(updates.workingHours) here.
        if (typeof updates.workingHours === 'string') {
            updates.workingHours = JSON.parse(updates.workingHours);
        }
        if (typeof updates.services === 'string') {
            updates.services = JSON.parse(updates.services);
        }

        const updatedProvider = await Provider.findByIdAndUpdate(
            providerId,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate("serviceCategory");

        if (!updatedProvider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully for public view",
            data: updatedProvider,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get current provider profile (Private)
const getMyProfile = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user.id).populate("serviceCategory");
        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerProvider,
    loginProvider,
    updateProviderProfile,
    getMyProfile
};
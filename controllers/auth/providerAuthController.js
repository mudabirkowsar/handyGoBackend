const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Provider = require("../../models/Provider");

// ==========================================
// GENERATE TOKEN
// ==========================================
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

// ==========================================
// REGISTER PROVIDER (Initial Step)
// ==========================================
const registerProvider = async (req, res) => {
    try {
        const { fullName, phone, password, serviceProvided, email } = req.body;

        // 1. Validate required fields
        if (!fullName || !phone || !password || !serviceProvided) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // 2. Check if provider already exists
        const existingProvider = await Provider.findOne({ phone });
        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: "Provider with this phone number already exists",
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create document 
        const provider = new Provider({
            role: "provider",
            fullName,
            phone,
            email: email ? email.toLowerCase().trim() : undefined,
            password: hashedPassword,
            serviceProvided,
            verificationStatus: "incomplete",
            // FIX: Provide default coordinates to satisfy the 2dsphere index
            location: {
                type: "Point",
                coordinates: [0, 0] // [longitude, latitude] - Default to 0,0
            }
        });

        // 5. Generate token (assuming you have this function)
        const token = generateToken(provider._id, "provider");

        // 6. Save
        await provider.save();

        res.status(201).json({
            success: true,
            message: "Registration successful. Please upload documents for verification.",
            token,
            provider: {
                _id: provider._id,
                fullName: provider.fullName,
                phone: provider.phone,
                role: provider.role,
                verificationStatus: provider.verificationStatus,
            },
        });
    } catch (error) {
        console.error("Error in registerProvider:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// LOGIN PROVIDER
// ==========================================
const loginProvider = async (req, res) => {
    try {
        // Change 'phone' to 'identifier' to represent either Email or Phone
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email/phone and password"
            });
        }

        // Clean the input: trim spaces and lowercase for email matching
        const cleanIdentifier = identifier.toLowerCase().trim();

        // Find provider where email matches OR phone matches
        const provider = await Provider.findOne({
            $or: [
                { email: cleanIdentifier },
                { phone: identifier.trim() }
            ]
        }).select("+password +tokens");

        // 1. Check if provider exists
        if (!provider) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 2. Check if password is correct
        const isMatch = await bcrypt.compare(password, provider.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 3. Check if account is blocked
        if (provider.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Account is blocked. Contact support."
            });
        }

        // 4. Generate Token
        const token = generateToken(provider._id, "provider");

        // 5. Store token (Ensure your schema has a tokens array)
        if (!provider.tokens) provider.tokens = [];
        provider.tokens.push({ token });

        // Limit stored sessions (optional, keeps DB clean)
        if (provider.tokens.length > 5) provider.tokens.shift();

        await provider.save();

        // 6. Final Response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            provider: {
                _id: provider._id,
                fullName: provider.fullName,
                email: provider.email,
                phone: provider.phone,
                role: provider.role,
                verificationStatus: provider.verificationStatus,
                profileImage: provider.profileImage || "",
            },
        });

    } catch (error) {
        console.error("Error in loginProvider:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};

// ==========================================
// SUBMIT DOCUMENTS (Moves status to Pending)
// ==========================================
const uploadProviderDocuments = async (req, res) => {
    try {
        const providerId = req.user._id; 
        const provider = await Provider.findById(providerId);

        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        const { aadhaarNumber, panNumber } = req.body;

        // Update text fields
        if (aadhaarNumber) provider.aadhaarNumber = aadhaarNumber;
        if (panNumber) provider.panNumber = panNumber.toUpperCase();

        // Handle File uploads via Multer (upload.fields)
        // Multer puts files in req.files[fieldName][0]
        if (req.files) {
            if (req.files['aadhaarFrontImage'] && req.files['aadhaarFrontImage'][0]) {
                provider.aadhaarFrontImage = req.files['aadhaarFrontImage'][0].path;
            }
            if (req.files['aadhaarBackImage'] && req.files['aadhaarBackImage'][0]) {
                provider.aadhaarBackImage = req.files['aadhaarBackImage'][0].path;
            }
            if (req.files['selfieImage'] && req.files['selfieImage'][0]) {
                provider.selfieImage = req.files['selfieImage'][0].path;
            }
        }

        // Only move to pending if all documents are present
        if (provider.aadhaarFrontImage && provider.aadhaarBackImage && provider.selfieImage) {
            provider.verificationStatus = "pending";
        }

        await provider.save();

        res.status(200).json({
            success: true,
            message: "Documents uploaded successfully. Admin review pending.",
            provider: {
                verificationStatus: provider.verificationStatus,
                aadhaarNumber: provider.aadhaarNumber,
                panNumber: provider.panNumber
            }
        });
    } catch (error) {
        console.error("Error in uploadProviderDocuments:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to process documents.", 
            error: error.message 
        });
    }
};


module.exports = {
    registerProvider,
    loginProvider,
    uploadProviderDocuments,
};
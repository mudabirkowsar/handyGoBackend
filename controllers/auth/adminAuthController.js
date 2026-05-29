const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");

// Helper to generate Token
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

// @desc    Register a new Admin
// @route   POST /api/admin/register
const registerAdmin = async (req, res) => {
    try {
        const { fullName, email, password, phone, permissions } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the admin instance
        const admin = new Admin({
            fullName,
            email,
            phone: phone || "",
            password: hashedPassword,
            permissions: permissions || ["all"],
        });

        // Generate token and store it in the tokens array
        const token = generateToken(admin._id, admin.role);
        admin.tokens = [{ token }]; 

        await admin.save();

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            token,
            admin: {
                _id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Register Admin Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login Admin
// @route   POST /api/admin/login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Note: we select +tokens so we can modify it
        const admin = await Admin.findOne({ email }).select("+password +tokens");

        if (!admin) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate New Token
        const token = generateToken(admin._id, admin.role);

        // Store token in database (Append to array for multiple devices or replace for single session)
        // For testing, let's keep it simple and just store the current one
        admin.tokens = admin.tokens.concat({ token });

        // Cleanup: Only keep the last 5 tokens to prevent DB bloat during dev
        if (admin.tokens.length > 5) {
            admin.tokens.shift();
        }

        admin.lastLoginAt = Date.now();
        await admin.save();

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            admin: {
                _id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                role: admin.role,
                tokens: admin.tokens // Returning this for Postman verification
            },
        });
    } catch (error) {
        console.error("Login Admin Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    loginAdmin,
    registerAdmin,
};
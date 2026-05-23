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

        // 1. Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (Name, Email, Password)",
            });
        }

        // 2. Check if admin already exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: "Admin with this email already exists",
            });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create Admin
        // Note: permissions is an array of strings like ["manage_companies", "verify_documents"]
        const admin = await Admin.create({
            fullName,
            email,
            phone: phone || "",
            password: hashedPassword,
            permissions: permissions || ["all"], // Default to all or specific list
        });

        if (admin) {
            res.status(201).json({
                success: true,
                message: "Admin registered successfully",
                token: generateToken(admin._id, admin.role),
                admin: {
                    _id: admin._id,
                    fullName: admin.fullName,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions,
                },
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid admin data",
            });
        }
    } catch (error) {
        console.error("Register Admin Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Existing Login Logic
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email }).select("+password");

        if (!admin) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Update last login
        admin.lastLoginAt = Date.now();
        await admin.save();

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            token: generateToken(admin._id, admin.role),
            admin,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    loginAdmin,
    registerAdmin,
};
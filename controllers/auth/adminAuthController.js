// controllers/auth/adminAuthController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../../models/Admin");

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({
            email,
        }).select("+password");

        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            token: generateToken(
                admin._id,
                admin.role
            ),
            admin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    loginAdmin,
};
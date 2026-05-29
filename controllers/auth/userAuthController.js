// controllers/auth/userAuthController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const Provider = require("../../models/Provider");


// ==========================================
// GENERATE TOKEN
// ==========================================

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );
};


// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            email,
            password,
        } = req.body;

        const existingUser = await User.findOne({
            phone,
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            fullName,
            phone,
            email,
            password: hashedPassword,
            role: "customer",
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: generateToken(user._id, user.role),
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// LOGIN USER
// ==========================================

// ==========================================
// LOGIN USER / PROVIDER
// ==========================================

const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // 1. Validate input
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email/phone and password",
            });
        }

        const cleanEmail = identifier.toLowerCase().trim();
        const cleanPhone = identifier.trim();

        // 2. Find User by Email OR Phone
        const user = await User.findOne({
            $or: [
                { email: cleanEmail },
                { phone: cleanPhone },
            ],
        }).select("+password tokens");

        // 3. Check if user exists
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // 4. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // 5. Token Generation
        const token = generateToken(user._id, "customer");

        // 6. Session / Token Management
        const isSingleSession = process.env.SINGLE_SESSION_ONLY === "true";

        if (isSingleSession) {
            // Only allow one active token
            user.tokens = [{ token }];
        } else {
            // Keep the last 5 tokens/sessions
            if (!user.tokens) user.tokens = [];
            user.tokens.push({ token });
            if (user.tokens.length > 5) {
                user.tokens = user.tokens.slice(-5);
            }
        }

        // 7. Save the updated user document
        await user.save();

        // 8. Final Response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: "customer",
                profileImage: user.profileImage || "",
            },
        });

    } catch (error) {
        console.error("User Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

module.exports = { registerUser, loginUser };
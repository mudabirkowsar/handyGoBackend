// controllers/auth/userAuthController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");


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

const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // 1. Validation
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Provide credentials" });
        }

        // 2. Find User
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase().trim() },
                { phone: identifier.trim() }
            ],
        }).select("+password tokens");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        let token;
        const isSingleSession = process.env.SINGLE_SESSION_ONLY === 'true';

        // 3. Logic: Check if we should reuse an existing token
        if (isSingleSession && user.tokens && user.tokens.length > 0) {
            // Grab the last issued token
            token = user.tokens[user.tokens.length - 1].token;

            // Verify if the existing token is still active and valid
            try {
                jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                // Token expired or secret changed: generate a fresh one
                token = generateToken(user._id, user.role);
                await User.findByIdAndUpdate(user._id, {
                    $set: { tokens: [{ token }] }
                });
            }
        } else {
            // 4. Multi-session/Standard Behavior: Append new session token
            token = generateToken(user._id, user.role);
            await User.findByIdAndUpdate(user._id, {
                $push: {
                    tokens: {
                        $each: [{ token }],
                        $slice: -5
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser };
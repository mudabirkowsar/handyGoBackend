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

        // ==========================================
        // VALIDATION
        // ==========================================

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Provide credentials",
            });
        }

        const cleanIdentifier =
            identifier.toLowerCase().trim();

        let account = null;
        let Model = null;
        let accountType = null;

        // ==========================================
        // SEARCH USER
        // ==========================================

        account = await User.findOne({
            $or: [
                { email: cleanIdentifier },
                { phone: identifier.trim() },
            ],
        }).select("+password tokens");

        if (account) {
            Model = User;
            accountType = "customer";
        }

        // ==========================================
        // SEARCH PROVIDER
        // ==========================================

        if (!account) {
            account = await Provider.findOne({
                $or: [
                    { email: cleanIdentifier },
                    { phone: identifier.trim() },
                ],
            }).select("+password tokens");

            if (account) {
                Model = Provider;
                accountType = "provider";
            }
        }

        // ==========================================
        // ACCOUNT NOT FOUND
        // ==========================================

        if (!account) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // ==========================================
        // PASSWORD CHECK
        // ==========================================

        const isMatch = await bcrypt.compare(
            password,
            account.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // ==========================================
        // FORCE CORRECT ROLE
        // ==========================================

        const role =
            accountType === "provider"
                ? "provider"
                : "customer";

        let token;

        const isSingleSession =
            process.env.SINGLE_SESSION_ONLY === "true";

        // ==========================================
        // SINGLE SESSION
        // ==========================================

        if (
            isSingleSession &&
            account.tokens &&
            account.tokens.length > 0
        ) {
            token =
                account.tokens[
                    account.tokens.length - 1
                ].token;

            try {
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );
            } catch (err) {
                token = generateToken(
                    account._id,
                    role
                );

                await Model.findByIdAndUpdate(
                    account._id,
                    {
                        $set: {
                            tokens: [{ token }],
                        },
                    }
                );
            }
        } else {

            // ==========================================
            // MULTI SESSION
            // ==========================================

            token = generateToken(
                account._id,
                role
            );

            await Model.findByIdAndUpdate(
                account._id,
                {
                    $push: {
                        tokens: {
                            $each: [{ token }],
                            $slice: -5,
                        },
                    },
                }
            );
        }

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,

            user: {
                _id: account._id,
                fullName: account.fullName,
                email: account.email,
                phone: account.phone,
                role: role,
                accountType: accountType,
                profileImage:
                    account.profileImage || "",
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { registerUser, loginUser };
// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Provider = require("../models/Provider");
const Company = require("../models/Company");

// ==========================================
// UNIVERSAL PROTECT MIDDLEWARE
// ==========================================
exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        // 1. Verify the JWT signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Identify the role type and look up across respective collection databases
        let account = null;

        if (decoded.role === "customer" || decoded.role === "admin") {
            account = await User.findOne({
                _id: decoded.id,
                "tokens.token": token
            }).select("-password");
        }
        else if (decoded.role === "provider") {
            account = await Provider.findOne({
                _id: decoded.id,
                "tokens.token": token
            }).select("-password");
        }
        else if (decoded.role === "company") {
            account = await Company.findOne({
                _id: decoded.id,
                "tokens.token": token
            }).select("-password");
        }

        // 3. Fallback check if cross-role token scanning fails
        if (!account) {
            return res.status(401).json({ success: false, message: "Invalid token or session expired" });
        }

        // 4. Attach authorized account object to request stream pipeline
        req.user = account;
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

// ==========================================
// ROLE CONTROLLER PRIVILEGE GUARDS
// ==========================================

// Guard for System Administrators
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
};

// Guard for Registered Companies
exports.isCompany = (req, res, next) => {
    if (req.user && req.user.role === "company") {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Company authorization required."
        });
    }
};
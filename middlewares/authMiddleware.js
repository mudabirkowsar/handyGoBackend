const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Provider = require("../models/Provider");
const Company = require("../models/Company");
const Admin = require("../models/Admin");

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

        if (decoded.role === "admin") {
            account = await Admin.findById(decoded.id).select("-password");
        } 
        else if (decoded.role === "customer" || decoded.role === "user") {
            account = await User.findById(decoded.id).select("-password");
        }
        else if (decoded.role === "provider") {
            account = await Provider.findById(decoded.id).select("-password");
        }
        else if (decoded.role === "company") {
            account = await Company.findById(decoded.id).select("-password");
        }

        // 3. Fallback check
        if (!account) {
            return res.status(401).json({ 
                success: false, 
                message: "Session expired or user not found" 
            });
        }

        // 4. Check if account is blocked (Universal check for all roles)
        if (account.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "This account has been blocked. Please contact support."
            });
        }

        // 5. Attach authorized account object to request stream
        req.user = account;
        req.token = token; 
        
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// ==========================================
// ROLE CONTROLLER PRIVILEGE GUARDS
// ==========================================

// ADMIN GUARD
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

// COMPANY GUARD
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

// PROVIDER GUARD (Added to support your Provider routes)
exports.isProvider = (req, res, next) => {
    if (req.user && req.user.role === "provider") {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Provider authorization required."
        });
    }
};
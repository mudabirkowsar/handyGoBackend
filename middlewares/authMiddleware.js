// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

        // 2. Find user AND check if token exists in their active sessions
        // This ensures the token is "live" in your DB
        const user = await User.findOne({ 
            _id: decoded.id, 
            "tokens.token": token 
        }).select("-password");

        if (!user) {
            console.log("Auth Fail: Token not found in User's DB array");
            return res.status(401).json({ success: false, message: "Invalid token or session expired" });
        }

        // 3. Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
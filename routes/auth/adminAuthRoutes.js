// routes/auth/adminAuthRoutes.js

const express = require("express");

const router = express.Router();

const {
    // registerAdmin,
    loginAdmin,
} = require("../../controllers/auth/adminAuthController");

router.post("/login", loginAdmin);

module.exports = router;
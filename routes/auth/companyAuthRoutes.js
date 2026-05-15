// routes/auth/companyAuthRoutes.js

const express = require("express");

const router = express.Router();

const {
    registerCompany,
    loginCompany,
} = require("../../controllers/auth/companyAuthController");

router.post("/register", registerCompany);

router.post("/login", loginCompany);

module.exports = router;
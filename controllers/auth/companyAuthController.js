// controllers/auth/companyAuthController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Company = require("../../models/Company");

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );
};

const registerCompany = async (req, res) => {
    try {
        const {
            companyName,
            companyPhone,
            companyEmail,
            password,
            ownerName, // 1. Added ownerName here
        } = req.body;

        // Basic validation check before hitting the DB
        if (!ownerName) {
            return res.status(400).json({
                success: false,
                message: "Owner name is required",
            });
        }

        const existingCompany = await Company.findOne({
            companyPhone,
        });

        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: "Company already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const company = await Company.create({
            companyName,
            companyPhone,
            companyEmail,
            ownerName, // 2. Added ownerName here
            password: hashedPassword,
            role: "company",
        });

        res.status(201).json({
            success: true,
            message: "Company registered successfully",
            token: generateToken(company._id, company.role),
            company,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const loginCompany = async (req, res) => {
    try {
        const { companyPhone, password } =
            req.body;

        const company = await Company.findOne({
            companyPhone,
        }).select("+password");

        if (!company) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            company.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: generateToken(
                company._id,
                company.role
            ),
            company,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    registerCompany,
    loginCompany,
};
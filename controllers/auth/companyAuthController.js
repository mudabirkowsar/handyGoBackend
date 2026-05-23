// controllers/auth/companyAuthController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Company = require("../../models/Company");

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
// REGISTER COMPANY (With DB Token Storage)
// ==========================================
const registerCompany = async (req, res) => {
    try {
        const {
            companyName,
            companyPhone,
            companyEmail,
            password,
            ownerName,
        } = req.body;

        // 1. Validate required fields
        if (!companyName || !companyPhone || !password || !ownerName) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // 2. Check if company already exists
        const existingCompany = await Company.findOne({ companyPhone });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: "Company already exists",
            });
        }

        // 3. Hash password and establish default role
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = "company";

        // 4. Create the document structure
        const company = new Company({
            companyName,
            companyPhone,
            companyEmail: companyEmail ? companyEmail.toLowerCase().trim() : undefined,
            ownerName,
            password: hashedPassword,
            role: role,
            verificationStatus: "pending",
        });

        // 5. Generate initial token
        const token = generateToken(company._id, role);

        // SAFE FIX: Initialize array dynamically if undefined in your Mongoose model instance
        if (!company.tokens) {
            company.tokens = [];
        }
        company.tokens.push({ token });

        // 6. Persist to database
        await company.save();

        // 7. Send payload response back to your client-side form
        res.status(201).json({
            success: true,
            message: "Company registered successfully. Proceed to documents.",
            navigateTo: "DocumentsPage",
            token,
            company: {
                _id: company._id,
                companyName: company.companyName,
                companyPhone: company.companyPhone,
                companyEmail: company.companyEmail,
                ownerName: company.ownerName,
                role: company.role,
                verificationStatus: company.verificationStatus,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// LOGIN COMPANY (Identical Logic to User Auth)
// ==========================================

const loginCompany = async (req, res) => {
    try {

        const { companyPhone, password } = req.body;

        // ==========================================
        // VALIDATION
        // ==========================================
        if (!companyPhone || !password) {
            return res.status(400).json({
                success: false,
                message: "Provide credentials",
            });
        }

        // ==========================================
        // FIND COMPANY
        // ==========================================
        const company = await Company.findOne({
            companyPhone,
        }).select("+password +tokens");

        if (!company) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // ==========================================
        // CHECK PASSWORD
        // ==========================================
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

        // ==========================================
        // GENERATE TOKEN
        // ==========================================
        const token = jwt.sign(
            {
                id: company._id,
                role: "company",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d",
            }
        );

        // ==========================================
        // STORE TOKEN IN DATABASE
        // ==========================================
        company.tokens.push({ token });

        await company.save();

        // ==========================================
        // RESPONSE
        // ==========================================
        res.status(200).json({
            success: true,
            message: "Login successful",

            token,

            company: {
                _id: company._id,

                role: company.role,

                verificationStatus:
                    company.verificationStatus,

                companyName:
                    company.companyName,

                companyPhone:
                    company.companyPhone,

                companyEmail:
                    company.companyEmail,

                ownerName:
                    company.ownerName,

                companyLogo:
                    company.companyLogo || "",

                isBlocked:
                    company.isBlocked,

                isActive:
                    company.isActive,

                createdAt:
                    company.createdAt,
            },
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// SUBMIT DOCUMENTS
// ==========================================
const uploadDocuments = async (req, res) => {
    try {
        const companyId = req.user._id;
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        // 1. Update text fields
        const { gstNumber, panNumber, cinNumber, businessRegistrationNumber } = req.body;
        
        if (gstNumber) company.gstNumber = gstNumber;
        if (panNumber) company.panNumber = panNumber;
        if (cinNumber) company.cinNumber = cinNumber;
        if (businessRegistrationNumber) company.businessRegistrationNumber = businessRegistrationNumber;

        // 2. Handle Files (Multer-Cloudinary puts file info in req.files)
        if (req.files) {
            if (req.files['gstCertificate']) company.gstCertificate = req.files['gstCertificate'][0].path;
            if (req.files['businessLicense']) company.businessLicense = req.files['businessLicense'][0].path;
            if (req.files['insuranceDocument']) company.insuranceDocument = req.files['insuranceDocument'][0].path;
            if (req.files['ownerIdProof']) company.ownerIdProof = req.files['ownerIdProof'][0].path;
        }

        company.verificationStatus = "pending";
        await company.save();

        res.status(200).json({
            success: true,
            message: "Documents uploaded and profile submitted for review.",
            verificationStatus: company.verificationStatus
        });
    } catch (error) {
        console.error("Upload Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



// ==========================================
// EDIT / UPDATE PROFILE POST-APPROVAL
// ==========================================
const updateCompanyProfile = async (req, res) => {
    try {
        const companyId = req.user.id;

        const currentCompanyStatus = await Company.findById(companyId);
        if (!currentCompanyStatus) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        if (currentCompanyStatus.verificationStatus !== "approved") {
            return res.status(403).json({
                success: false,
                message: `Action denied. Account status is: ${currentCompanyStatus.verificationStatus}.`,
            });
        }

        const {
            companyLogo,
            coverImage,
            description,
            foundedYear,
            website,
            companySize,
            managerName,
            managerPhone,
            serviceCategories,
            services,
            address,
            location,
            serviceRadiusKm,
            businessHours,
            bankDetails,
        } = req.body;

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            {
                $set: {
                    companyLogo,
                    coverImage,
                    description,
                    foundedYear,
                    website,
                    companySize,
                    managerName,
                    managerPhone,
                    serviceCategories,
                    services,
                    address,
                    location,
                    serviceRadiusKm,
                    businessHours,
                    bankDetails,
                },
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Company profile updated successfully",
            company: updatedCompany,
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
    uploadDocuments,
    updateCompanyProfile,
};
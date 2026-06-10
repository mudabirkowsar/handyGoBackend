// controllers/company/companyController.js

const Company = require("../../models/Company");
const Worker = require("../../models/Worker");

// =====================================================
// GET MY COMPANY PROFILE
// =====================================================
const getMyCompanyProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.user.id)
            .populate("workers")
            .select("-password -tokens -refreshToken");

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        res.status(200).json({
            success: true,
            company,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// UPDATE COMPANY PROFILE
// =====================================================
const updateCompanyProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        // =====================================================
        // 1. TEXT FIELDS & PROFILE BASICS
        // =====================================================
        if (req.body.companyName) company.companyName = req.body.companyName;
        if (req.body.description) company.description = req.body.description;
        if (req.body.website !== undefined) company.website = req.body.website;
        if (req.body.companySize) company.companySize = req.body.companySize;
        if (req.body.foundedYear) company.foundedYear = req.body.foundedYear;
        if (req.body.serviceRadiusKm) company.serviceRadiusKm = req.body.serviceRadiusKm;

        // =====================================================
        // 2. OWNER & MANAGER DETAILS
        // =====================================================
        if (req.body.ownerName) company.ownerName = req.body.ownerName;
        if (req.body.ownerPhone !== undefined) company.ownerPhone = req.body.ownerPhone;
        if (req.body.ownerEmail !== undefined) company.ownerEmail = req.body.ownerEmail;
        if (req.body.managerName !== undefined) company.managerName = req.body.managerName;
        if (req.body.managerPhone !== undefined) company.managerPhone = req.body.managerPhone;

        // =====================================================
        // 3. LEGAL DOCUMENTS (Tax / Registrations)
        // =====================================================
        if (req.body.gstNumber !== undefined) company.gstNumber = req.body.gstNumber;
        if (req.body.panNumber !== undefined) company.panNumber = req.body.panNumber;
        if (req.body.cinNumber !== undefined) company.cinNumber = req.body.cinNumber;
        if (req.body.businessRegistrationNumber !== undefined) {
            company.businessRegistrationNumber = req.body.businessRegistrationNumber;
        }

        // =====================================================
        // 4. NESTED STRUCTURES (Address, Business Hours, Bank)
        // =====================================================

        // Static Address text parsing
        if (req.body.address) {
            const parsedAddress = typeof req.body.address === 'string' ? JSON.parse(req.body.address) : req.body.address;
            company.address = { ...company.address, ...parsedAddress };
        }

        // Operational Business Hours parsing
        if (req.body.businessHours) {
            const parsedHours = typeof req.body.businessHours === 'string' ? JSON.parse(req.body.businessHours) : req.body.businessHours;
            company.businessHours = { ...company.businessHours, ...parsedHours };
        }

        // Financial Banking details parsing
        if (req.body.bankDetails) {
            const parsedBank = typeof req.body.bankDetails === 'string' ? JSON.parse(req.body.bankDetails) : req.body.bankDetails;
            company.bankDetails = { ...company.bankDetails, ...parsedBank };
        }

        // Preference Flags
        if (req.body.notificationPreferences) {
            const parsedPrefs = typeof req.body.notificationPreferences === 'string' ? JSON.parse(req.body.notificationPreferences) : req.body.notificationPreferences;
            company.notificationPreferences = { ...company.notificationPreferences, ...parsedPrefs };
        }

        // =====================================================
        // 5. IMAGE & DOCUMENT MUTATIONS (req.files)
        // =====================================================
        if (req.files) {
            // Single Images
            if (req.files.companyLogo?.[0]) company.companyLogo = req.files.companyLogo[0].path;
            if (req.files.coverImage?.[0]) company.coverImage = req.files.coverImage[0].path;

            // Single Legal verification documents
            if (req.files.gstCertificate?.[0]) company.gstCertificate = req.files.gstCertificate[0].path;
            if (req.files.businessLicense?.[0]) company.businessLicense = req.files.businessLicense[0].path;
            if (req.files.insuranceDocument?.[0]) company.insuranceDocument = req.files.insuranceDocument[0].path;
            if (req.files.ownerIdProof?.[0]) company.ownerIdProof = req.files.ownerIdProof[0].path;

            // Arrays (Pushing new paths dynamically into arrays)
            if (req.files.companyPhotos) {
                const photos = req.files.companyPhotos.map(file => file.path);
                company.companyPhotos.push(...photos);
            }
            if (req.files.portfolioImages) {
                const portfolios = req.files.portfolioImages.map(file => file.path);
                company.portfolioImages.push(...portfolios);
            }
            if (req.files.completedProjectImages) {
                const completedProjects = req.files.completedProjectImages.map(file => file.path);
                company.completedProjectImages.push(...completedProjects);
            }
        }

        // Trigger safe middleware updates/validations via standard document save hook
        await company.save();

        res.status(200).json({
            success: true,
            message: "Company profile updated successfully",
            company,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * @desc    Update company geospatial 2dsphere location coordinates
 * @route   PATCH /api/v1/company/location
 * @access  Private (Company Only)
 */
const updateCompanyLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Please provide both latitude and longitude values.",
            });
        }

        // Format values explicitly to Float types
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Validation bounds check for Earth coordinates
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid coordinates boundaries. Latitude (-90 to 90), Longitude (-180 to 180).",
            });
        }

        // Update document using valid MongoDB GeoJSON standard [longitude, latitude]
        const company = await Company.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    location: {
                        type: "Point",
                        coordinates: [lng, lat],
                    },
                },
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company profile record not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Geospatial location updated successfully",
            location: company.location,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET ALL COMPANIES
// =====================================================
const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find({
            verificationStatus:
                "approved",
            isBlocked: false,
            isDeleted: false,
        })
            .select("-password");

        res.status(200).json({
            success: true,
            totalCompanies:
                companies.length,
            companies,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET SINGLE COMPANY
// =====================================================
const getSingleCompany = async (req, res) => {
    try {

        const company =
            await Company.findById(
                req.params.companyId
            )
                .populate("workers")
                .select("-password");

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        res.status(200).json({
            success: true,
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
    getMyCompanyProfile,
    updateCompanyProfile,
    getAllCompanies,
    getSingleCompany,
    updateCompanyLocation,
};
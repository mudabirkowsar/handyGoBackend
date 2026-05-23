// controllers/company/companyController.js

const Company = require("../../models/Company");
const Worker = require("../../models/Worker");

// =====================================================
// GET MY COMPANY PROFILE
// =====================================================
const getMyCompanyProfile = async (req, res) => {
    try {

        const company = await Company.findById(
            req.user.id
        )
            .populate("serviceCategories")
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

// =====================================================
// UPDATE COMPANY PROFILE
// =====================================================
const updateCompanyProfile = async (
    req,
    res
) => {
    try {

        const company = await Company.findById(
            req.user.id
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        company.companyName =
            req.body.companyName ||
            company.companyName;

        company.description =
            req.body.description ||
            company.description;

        company.website =
            req.body.website ||
            company.website;

        company.ownerName =
            req.body.ownerName ||
            company.ownerName;

        company.ownerPhone =
            req.body.ownerPhone ||
            company.ownerPhone;

        company.ownerEmail =
            req.body.ownerEmail ||
            company.ownerEmail;

        company.companySize =
            req.body.companySize ||
            company.companySize;

        if (req.files?.companyLogo) {
            company.companyLogo =
                req.files.companyLogo[0].path;
        }

        if (req.files?.coverImage) {
            company.coverImage =
                req.files.coverImage[0].path;
        }

        await company.save();

        res.status(200).json({
            success: true,
            message:
                "Company profile updated",
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
// CREATE COMPANY SERVICE
// =====================================================
const createCompanyService = async (req, res) => {
    try {

        const company = await Company.findById(
            req.user.id
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const {
            title,
            description,
            basePrice,
            pricingType,
            estimatedDurationMinutes,
        } = req.body;

        company.services.push({
            title,
            description,
            basePrice,
            pricingType,
            estimatedDurationMinutes,
        });

        await company.save();

        res.status(201).json({
            success: true,
            message:
                "Service created successfully",
            services: company.services,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET COMPANY SERVICES
// =====================================================
const getCompanyServices = async (req, res) => {
    try {

        const company = await Company.findById(
            req.user.id
        );

        res.status(200).json({
            success: true,
            services: company.services,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// UPDATE COMPANY SERVICE
// =====================================================
const updateCompanyService = async (req, res) => {
    try {

        const { serviceId } = req.params;

        const company = await Company.findById(
            req.user.id
        );

        const service =
            company.services.id(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        service.title =
            req.body.title || service.title;

        service.description =
            req.body.description ||
            service.description;

        service.basePrice =
            req.body.basePrice ||
            service.basePrice;

        service.pricingType =
            req.body.pricingType ||
            service.pricingType;

        service.estimatedDurationMinutes =
            req.body
                .estimatedDurationMinutes ||
            service.estimatedDurationMinutes;

        service.isActive =
            req.body.isActive ??
            service.isActive;

        await company.save();

        res.status(200).json({
            success: true,
            message:
                "Service updated successfully",
            service,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// DELETE COMPANY SERVICE
// =====================================================
const deleteCompanyService = async (
    req,
    res
) => {
    try {

        const { serviceId } = req.params;

        const company = await Company.findById(
            req.user.id
        );

        const service =
            company.services.id(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        service.deleteOne();

        await company.save();

        res.status(200).json({
            success: true,
            message:
                "Service deleted successfully",
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
            .populate("serviceCategories")
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
                .populate("serviceCategories")
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
    createCompanyService,
    getCompanyServices,
    updateCompanyService,
    deleteCompanyService,
    getAllCompanies,
    getSingleCompany,
};
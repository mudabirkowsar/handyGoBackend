const Company = require("../../models/Company");

/// @desc    Get all companies with optional filtering by verification status
exports.getAllCompanies = async (req, res) => {
    try {
        const { status } = req.query; // e.g., ?status=pending
        
        const filter = {};
        if (status) {
            filter.verificationStatus = status;
        }

        const companies = await Company.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: companies.length,
            data: companies
        });
    } catch (error) {
        console.error("Error fetching companies:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/// @desc    Get details of a specific company by ID
exports.getCompanyDetails = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        return res.status(200).json({ success: true, data: company });
    } catch (error) {
        console.error("Error fetching company details:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/// @desc    Verify (approve/reject) a company application
exports.verifyCompany = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        // Validation
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Must be 'approved' or 'rejected'." 
            });
        }

        if (status === "rejected" && !rejectionReason) {
            return res.status(400).json({ 
                success: false, 
                message: "A rejection reason is required when rejecting a company." 
            });
        }

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        // Update fields based on decision
        company.verificationStatus = status;
        
        if (status === "approved") {
            company.verifiedAt = new Date();
            company.rejectionReason = undefined; // Clear any past rejection reason
            company.isActive = true; 
        } else {
            company.rejectionReason = rejectionReason;
            company.verifiedAt = undefined;
            company.isActive = false; // Keep inactive if rejected
        }

        await company.save();

        // Real project extension point: You would typically trigger an email/SMS notification here
        // sendVerificationEmail(company.companyEmail, status, rejectionReason);

        return res.status(200).json({
            success: true,
            message: `Company application has been ${status}.`,
            data: company
        });
    } catch (error) {
        console.error("Error during company verification:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
const Company = require("../../models/Company"); // Adjust path if needed

/**
 * @desc    Get current business hours for the logged-in company
 * @route   GET /api/company/business-hours
 * @access  Private (Company Auth)
 */
const getBusinessHours = async (req, res) => {
  try {
    // Assuming your auth middleware populates req.company.id or req.user.id
    const companyId = req.company?.id || req.user?.id; 

    const company = await Company.findById(companyId).select("businessHours companyName");
    if (!company) {
      return res.status(404).json({ message: "Company profile not found." });
    }

    res.status(200).json({
      message: "Business hours retrieved successfully.",
      businessHours: company.businessHours
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch business hours.", error: error.message });
  }
};

/**
 * @desc    Update entire business hours matrix (Full Week Update)
 * @route   PUT /api/company/business-hours
 * @access  Private (Company Auth)
 */
const updateAllBusinessHours = async (req, res) => {
  try {
    const companyId = req.company?.id || req.user?.id;
    const { businessHours } = req.body;

    if (!businessHours) {
      return res.status(400).json({ message: "Business hours payload config structure is required." });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company profile not found." });
    }

    // Days map array to run structure sanitization check
    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
    // Apply nested updates safely to prevent destroying unpassed day keys
    validDays.forEach((day) => {
      if (businessHours[day]) {
        if (businessHours[day].isOpen !== undefined) {
          company.businessHours[day].isOpen = businessHours[day].isOpen;
        }
        if (businessHours[day].open !== undefined) {
          company.businessHours[day].open = businessHours[day].open;
        }
        if (businessHours[day].close !== undefined) {
          company.businessHours[day].close = businessHours[day].close;
        }
      }
    });

    const updatedCompany = await company.save();
    res.status(200).json({
      message: "Weekly business operational calendar updated successfully.",
      businessHours: updatedCompany.businessHours
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to map global weekly parameters.", error: error.message });
  }
};

/**
 * @desc    Update a specific single day's timings
 * @route   PATCH /api/company/business-hours/:day
 * @access  Private (Company Auth)
 */
const updateSingleDayHours = async (req, res) => {
  try {
    const companyId = req.company?.id || req.user?.id;
    const { day } = req.params;
    const { isOpen, open, close } = req.body;

    const normalizedDay = day.toLowerCase();
    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    if (!validDays.includes(normalizedDay)) {
      return res.status(400).json({ message: `Invalid day parameter string: '${day}'.` });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company profile not found." });
    }

    // Direct targeted updates
    if (isOpen !== undefined) company.businessHours[normalizedDay].isOpen = isOpen;
    if (open !== undefined) company.businessHours[normalizedDay].open = open;
    if (close !== undefined) company.businessHours[normalizedDay].close = close;

    const updatedCompany = await company.save();
    res.status(200).json({
      message: `Operational schedule for ${normalizedDay} updated cleanly.`,
      daySchedule: updatedCompany.businessHours[normalizedDay]
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to isolate targeted single-day adjustment.", error: error.message });
  }
};

/**
 * @desc    Quick toggle standard open/closed status for a day without resetting time inputs
 * @route   PATCH /api/company/business-hours/:day/toggle
 * @access  Private (Company Auth)
 */
const toggleDayStatus = async (req, res) => {
  try {
    const companyId = req.company?.id || req.user?.id;
    const { day } = req.params;

    const normalizedDay = day.toLowerCase();
    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    if (!validDays.includes(normalizedDay)) {
      return res.status(400).json({ message: `Invalid day context string: '${day}'.` });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company profile not found." });
    }

    // Flip binary state inversion switch
    company.businessHours[normalizedDay].isOpen = !company.businessHours[normalizedDay].isOpen;

    const updatedCompany = await company.save();
    res.status(200).json({
      message: `${normalizedDay} toggle state altered successfully.`,
      daySchedule: updatedCompany.businessHours[normalizedDay]
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to flip day availability status.", error: error.message });
  }
};

module.exports = {
  getBusinessHours,
  updateAllBusinessHours,
  updateSingleDayHours,
  toggleDayStatus
};
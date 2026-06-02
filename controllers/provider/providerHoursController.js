const Provider = require("../../models/Provider");

/**
 * @desc    Get current working hours and overtime settings
 * @route   GET /api/provider/working-hours
 * @access  Private (Provider Only)
 */
exports.getWorkingHours = async (req, res) => {
  try {
    // Assuming req.user._id is populated by your authentication middleware
    const provider = await Provider.findById(req.user._id).select("workingHours overtime");

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      workingHours: provider.workingHours,
      overtime: provider.overtime || { isOvertimeEnabled: false, start: "", end: "" },
    });
  } catch (error) {
    console.error("Error fetching working hours:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch schedule configurations.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update regular weekly working hours
 * @route   PUT /api/provider/working-hours
 * @access  Private (Provider Only)
 */
exports.updateWorkingHours = async (req, res) => {
  try {
    const { workingHours } = req.body;

    if (!workingHours) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid working hours payload data.",
      });
    }

    // Input data sanitization: validate simple 24hr time patterns if strings are provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    for (const day of days) {
      if (workingHours[day] && workingHours[day].isAvailable) {
        const { start, end } = workingHours[day];
        if (!start || !end || !timeRegex.test(start) || !timeRegex.test(end)) {
          return res.status(400).json({
            success: false,
            message: `Invalid time format for ${day}. Please look up time in HH:MM format.`,
          });
        }
      }
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      req.user._id,
      { $set: { workingHours } },
      { new: true, runValidators: true }
    ).select("workingHours overtime");

    return res.status(200).json({
      success: true,
      message: "Weekly working hours updated successfully.",
      workingHours: updatedProvider.workingHours,
    });
  } catch (error) {
    console.error("Error updating working hours:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while updating standard working hours.",
      error: error.message,
    });
  }
};

/**
 * @desc    Configure or Toggle Overtime / Extra parameters
 * @route   PUT /api/provider/overtime
 * @access  Private (Provider Only)
 */
exports.updateOvertimeSettings = async (req, res) => {
  try {
    const { isOvertimeEnabled, start, end } = req.body;

    // Validation logic if provider wants to set extra shifts
    if (isOvertimeEnabled) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!start || !end || !timeRegex.test(start) || !timeRegex.test(end)) {
        return res.status(400).json({
          success: false,
          message: "When extra hours are enabled, a valid starting and ending time (HH:MM) is mandatory.",
        });
      }
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          overtime: {
            isOvertimeEnabled,
            start: isOvertimeEnabled ? start : "",
            end: isOvertimeEnabled ? end : "",
          },
        },
      },
      { new: true, runValidators: true }
    ).select("workingHours overtime");

    return res.status(200).json({
      success: true,
      message: "Overtime configurations adjusted successfully.",
      overtime: updatedProvider.overtime,
    });
  } catch (error) {
    console.error("Error setting overtime preferences:", error);
    return res.status(500).json({
      success: false,
      message: "Server failure adjusting overtime profiles.",
      error: error.message,
    });
  }
};
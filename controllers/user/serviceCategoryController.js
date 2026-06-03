// controllers/serviceCategoryController.js

const ServiceCategory = require("../../models/ServiceCategory");

// @desc    Get all service categories for display on screen
// @route   GET /api/categories
// @access  Public / Protected (Accessible to Users)
exports.getAllCategories = async (req, res) => {
  try {
    // .select("name description") ensures we only fetch fields needed for the UI, optimizing memory and speed
    const categories = await ServiceCategory.find({})
      .select("name description")
      .sort({ name: 1 }); // Sorts alphabetically A-Z

    res.status(200).json({
      success: true,
      count: categories.length,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
      error: error.message,
    });
  }
};
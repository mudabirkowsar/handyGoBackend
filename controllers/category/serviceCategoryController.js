const ServiceCategory = require("../../models/ServiceCategory");

// @desc    Create a new service category
// @route   POST /api/v1/categories
const createCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all service categories
// @route   GET /api/v1/categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await ServiceCategory.find({ isActive: true });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a service category
// @route   PUT /api/v1/categories/:id
const updateCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a service category (Hard Delete)
// @route   DELETE /api/v1/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};
const ServiceCategory = require("../../models/ServiceCategory"); // Adjust path if needed

// @desc    Create a new service category
// @route   POST /api/service-categories
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required." });
        }

        // Check for duplicate names
        const existingCategory = await ServiceCategory.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "A category with this name already exists." });
        }

        const category = await ServiceCategory.create({ name, description });
        res.status(201).json({ message: "Category created successfully", data: category });
    } catch (error) {
        res.status(500).json({ message: "Failed to create category", error: error.message });
    }
};

// @desc    Get all service categories (with optional filter for active ones)
// @route   GET /api/service-categories
const getAllCategories = async (req, res) => {
    try {
        const { activeOnly } = req.query;
        const filter = activeOnly === "true" ? { isActive: true } : {};

        const categories = await ServiceCategory.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
};

// @desc    Get a single service category by ID
// @route   GET /api/service-categories/:id
const getCategoryById = async (req, res) => {
    try {
        const category = await ServiceCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }
        res.status(200).json({ data: category });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch category", error: error.message });
    }
};

// @desc    Update a service category by ID
// @route   PUT /api/service-categories/:id
const updateCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const categoryId = req.params.id;

        // Verify entity footprint exists
        const category = await ServiceCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }

        // Prevent collision if changing name to an existing one
        if (name && name !== category.name) {
            const nameCollision = await ServiceCategory.findOne({ name });
            if (nameCollision) {
                return res.status(400).json({ message: "Another category already uses this name." });
            }
        }

        category.name = name ?? category.name;
        category.description = description ?? category.description;
        category.isActive = isActive ?? category.isActive;

        const updatedCategory = await category.save();
        res.status(200).json({ message: "Category updated successfully", data: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Failed to update category", error: error.message });
    }
};

// @desc    Delete a service category by ID
// @route   DELETE /api/service-categories/:id
const deleteCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }
        res.status(200).json({ message: "Category permanently deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
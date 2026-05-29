const ServiceCategory = require("../../models/ServiceCategory");

// @desc    Create a new category (Admin Only)
// @route   POST /api/category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if category already exists
        const exists = await ServiceCategory.findOne({ name });
        if (exists) return res.status(400).json({ success: false, message: "Category already exists" });

        const categoryData = { name, description };

        // Handle File Uploads (Icon and Image)
        if (req.files) {
            if (req.files.icon) categoryData.icon = req.files.icon[0].path;
            if (req.files.image) categoryData.image = req.files.image[0].path;
        }

        const category = await ServiceCategory.create(categoryData);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active categories (Public/Company/Worker)
// @route   GET /api/category
exports.getAllCategories = async (req, res) => {
    try {
        // Companies usually only need active categories
        const filter = req.user?.role === 'admin' ? {} : { isActive: true };

        const categories = await ServiceCategory.find(filter).sort("name");

        res.status(200).json({
            success: true,
            results: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single category
// @route   GET /api/category/:id
exports.getSingleCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Not found" });

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid ID" });
    }
};

// @desc    Update category (Admin Only)
// @route   PUT /api/category/:id
exports.updateCategory = async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (req.files) {
            if (req.files.icon) updateData.icon = req.files.icon[0].path;
            if (req.files.image) updateData.image = req.files.image[0].path;
        }

        const category = await ServiceCategory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!category) return res.status(404).json({ success: false, message: "Not found" });

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete category (Admin Only)
// @route   DELETE /api/category/:id
exports.deleteCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Not found" });

        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
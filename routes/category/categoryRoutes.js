const express = require("express");
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory
} = require("../../controllers/category/categoryController");

const { protect, isAdmin } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

// Apply authentication and admin guards to all routes below
router.use(protect);
router.use(isAdmin);

// Route for listing all categories and creating a new one
router.route("/")
    .get(getAllCategories)
    .post(
        upload.fields([
            { name: "icon", maxCount: 1 },
            { name: "image", maxCount: 1 }
        ]),
        createCategory
    );

// Routes for specific category operations (Get, Update, Delete)
router.route("/:id")
    .get(getSingleCategory)
    .put(
        upload.fields([
            { name: "icon", maxCount: 1 },
            { name: "image", maxCount: 1 }
        ]),
        updateCategory
    )
    .delete(deleteCategory);

module.exports = router;
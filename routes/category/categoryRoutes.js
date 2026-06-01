const express = require("express");
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../../controllers/category/categoryController");

// Primary collection pipelines
router.route("/")
    .post(createCategory)
    .get(getAllCategories);

// Targeted element pipelines 
router.route("/:id")
    .get(getCategoryById)
    .put(updateCategory)
    .delete(deleteCategory);

module.exports = router;
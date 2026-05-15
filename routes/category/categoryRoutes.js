const express = require("express");
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} = require("../../controllers/category/serviceCategoryController");

// Basic Routes
router.route("/")
    .get(getAllCategories)
    .post(createCategory);

router.route("/:id")
    .put(updateCategory)
    .delete(deleteCategory);

module.exports = router;
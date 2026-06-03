// routes/categoryRoutes.js

const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../../controllers/user/serviceCategoryController");

// Public or user-authenticated route to list options
router.get("/all", getAllCategories);

module.exports = router;
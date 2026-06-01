const {
    getAllProviders,
    getProviderById,
    verifyProvider,
    toggleBlockProvider,
    updateProviderAdmin,
    deleteProvider,
    getProviderStats,
} = require("../../controllers/admin/providerController");
const { protect, isAdmin } = require("../../middlewares/authMiddleware");const express = require("express");
const router = express.Router();

// Note: You should add your protect/admin middleware here 
// e.g., router.use(protect, adminOnly);

// All routes here should be protected and restricted to Admin
router.use(protect);
router.use(isAdmin);
router.get("/stats/overview", getProviderStats);

router.route("/")
  .get(getAllProviders);

router.route("/:id")
  .get(getProviderById)
  .put(updateProviderAdmin)
  .delete(deleteProvider);

router.patch("/:id/verify", verifyProvider);
router.patch("/:id/block", toggleBlockProvider);

module.exports = router;
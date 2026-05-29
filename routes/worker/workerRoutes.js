// routes/worker/workerRoutes.js

const express = require("express");

const router = express.Router();

const { protect } = require("../../middlewares/authMiddleware");

const upload = require("../../middlewares/uploadMiddleware");

const {
    createWorker,
    getCompanyWorkers,
    getSingleWorker,
    updateWorker,
    deleteWorker,
    toggleWorkerStatus,
} = require("../../controllers/worker/workerController");

// ==========================================
// CREATE WORKER
// ==========================================
router.post(
    "/create",
    protect,
    upload.fields([
        { name: "profileImage", maxCount: 1 },
    ]),
    createWorker
);

// ==========================================
// GET ALL COMPANY WORKERS
// ==========================================
router.get(
    "/my-workers",
    protect,
    getCompanyWorkers
);

// ==========================================
// GET SINGLE WORKER
// ==========================================
router.get(
    "/:workerId",
    protect,
    getSingleWorker
);

// ==========================================
// UPDATE WORKER
// ==========================================
router.put(
    "/update/:workerId",
    protect,
    upload.fields([
        { name: "profileImage", maxCount: 1 },
    ]),
    updateWorker
);

// ==========================================
// TOGGLE WORKER STATUS
// ==========================================
router.patch(
    "/toggle-status/:workerId",
    protect,
    toggleWorkerStatus
);

// ==========================================
// DELETE WORKER
// ==========================================
router.delete(
    "/delete/:workerId",
    protect,
    deleteWorker
);



module.exports = router;
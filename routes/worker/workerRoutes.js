// routes/worker/workerRoutes.js

const express = require("express");

const router = express.Router();

const {protect} = require("../../middlewares/authMiddleware");

const upload = require("../../middlewares/uploadMiddleware");

const {
    createWorker,
    getCompanyWorkers,
    getSingleWorker,
    updateWorker,
    deleteWorker, 
} = require("../../controllers/worker/workerController");

router.post(
    "/create",
    protect,
    upload.single("profileImage"),
    createWorker
);

router.get(
    "/my-workers",
    protect,
    getCompanyWorkers
);

router.get(
    "/:workerId",
    protect,    
    getSingleWorker
);

router.put(
    "/update/:workerId",
    protect,
    upload.single("profileImage"),
    updateWorker
);

router.delete(
    "/delete/:workerId",
    protect,
    deleteWorker
);

module.exports = router;
// controllers/worker/workerController.js

const Worker = require("../../models/Worker");
const Company = require("../../models/Company");

// =====================================================
// CREATE WORKER
// =====================================================
const createWorker = async (req, res) => {
    try {

        const company =
            await Company.findById(
                req.user.id
            );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const {
            fullName,
            phone,
            email,
            designation,
            serviceCategory,
            skills,
            experienceYears,
            hourlyRate,
        } = req.body;

        const existingWorker =
            await Worker.findOne({
                phone,
            });

        if (existingWorker) {
            return res.status(400).json({
                success: false,
                message:
                    "Worker already exists",
            });
        }

        const worker =
            await Worker.create({
                fullName,
                phone,
                email,
                designation,
                serviceCategory,
                skills,
                experienceYears,
                hourlyRate,
                companyId: company._id,
                profileImage: req.file
                    ? req.file.path
                    : "",
            });

        company.workers.push(worker._id);

        company.totalWorkers =
            company.workers.length;

        await company.save();

        res.status(201).json({
            success: true,
            message:
                "Worker created successfully",
            worker,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET COMPANY WORKERS
// =====================================================
const getCompanyWorkers = async (req, res) => {
    try {

        const workers =
            await Worker.find({
                companyId: req.user.id,
            }).populate(
                "serviceCategory"
            );

        res.status(200).json({
            success: true,
            totalWorkers:
                workers.length,
            workers,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// GET SINGLE WORKER
// =====================================================
const getSingleWorker = async (req, res) => {
    try {

        const worker =
            await Worker.findById(
                req.params.workerId
            ).populate(
                "serviceCategory"
            );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            worker,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// UPDATE WORKER
// =====================================================
const updateWorker = async (req, res) => {
    try {

        const worker =
            await Worker.findById(
                req.params.workerId
            );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        worker.fullName =
            req.body.fullName ||
            worker.fullName;

        worker.designation =
            req.body.designation ||
            worker.designation;

        worker.skills =
            req.body.skills ||
            worker.skills;

        worker.hourlyRate =
            req.body.hourlyRate ||
            worker.hourlyRate;

        worker.experienceYears =
            req.body.experienceYears ||
            worker.experienceYears;

        worker.availabilityStatus =
            req.body
                .availabilityStatus ||
            worker.availabilityStatus;

        worker.isOnline =
            req.body.isOnline ??
            worker.isOnline;

        if (req.file) {
            worker.profileImage =
                req.file.path;
        }

        await worker.save();

        res.status(200).json({
            success: true,
            message:
                "Worker updated successfully",
            worker,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// =====================================================
// DELETE WORKER
// =====================================================
const deleteWorker = async (req, res) => {
    try {

        const worker =
            await Worker.findById(
                req.params.workerId
            );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        await Company.findByIdAndUpdate(
            worker.companyId,
            {
                $pull: {
                    workers: worker._id,
                },
            }
        );

        await Worker.findByIdAndDelete(
            worker._id
        );

        res.status(200).json({
            success: true,
            message:
                "Worker deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

module.exports = {
    createWorker,
    getCompanyWorkers,
    getSingleWorker,
    updateWorker,
    deleteWorker,
};
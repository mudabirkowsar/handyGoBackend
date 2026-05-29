// controllers/worker/workerController.js

const Worker = require("../../models/Worker");
const Company = require("../../models/Company");


// ==========================================
// CREATE WORKER
// ==========================================
const createWorker = async (req, res) => {
    try {

        const {
            fullName,
            phone,
            email,
            employeeId,
            designation,
            skills,
            experienceYears,
            address,
            serviceProvided,
        } = req.body;

        // ==========================================
        // CHECK EXISTING WORKER
        // ==========================================
        const existingWorker = await Worker.findOne({ phone });

        if (existingWorker) {
            return res.status(400).json({
                success: false,
                message: "Worker already exists with this phone number",
            });
        }

        // ==========================================
        // COMPANY ID FROM TOKEN
        // ==========================================
        const companyId = req.user._id;

        // ==========================================
        // PROFILE IMAGE
        // ==========================================
        let profileImage = "";

        if (req.files?.profileImage) {
            profileImage = req.files.profileImage[0].path;
        }

        // ==========================================
        // CREATE WORKER
        // ==========================================
        const worker = await Worker.create({
            fullName,
            phone,
            email,
            profileImage,
            companyId,
            employeeId,
            designation,
            serviceProvided,
            skills: skills
                ? JSON.parse(skills)
                : [],
            experienceYears,
            address: address
                ? JSON.parse(address)
                : {},
        });

        // ==========================================
        // ADD WORKER ID TO COMPANY
        // ==========================================
        await Company.findByIdAndUpdate(
            companyId,
            {
                $push: {
                    workers: worker._id,
                },

                $inc: {
                    totalWorkers: 1,
                },
            },
            { new: true }
        );

        // ==========================================
        // RESPONSE
        // ==========================================
        res.status(201).json({
            success: true,
            message: "Worker created successfully",
            worker,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};




// ==========================================
// GET ALL COMPANY WORKERS
// ==========================================
const getCompanyWorkers = async (req, res) => {
    try {

        const companyId = req.user._id;

        const workers = await Worker.find({ companyId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalWorkers: workers.length,
            workers,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// ==========================================
// GET SINGLE WORKER
// ==========================================
const getSingleWorker = async (req, res) => {
    try {

        const { workerId } = req.params;

        const worker = await Worker.findOne({
            _id: workerId,
            companyId: req.user._id,
        });

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



// ==========================================
// UPDATE WORKER
// ==========================================
const updateWorker = async (req, res) => {
    try {

        const { workerId } = req.params;

        const worker = await Worker.findOne({
            _id: workerId,
            companyId: req.user._id,
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // PROFILE IMAGE
        if (req.files?.profileImage) {
            worker.profileImage = req.files.profileImage[0].path;
        }

        // UPDATE FIELDS
        worker.fullName = req.body.fullName || worker.fullName;
        worker.phone = req.body.phone || worker.phone;
        worker.email = req.body.email || worker.email;
        worker.employeeId = req.body.employeeId || worker.employeeId;
        worker.designation = req.body.designation || worker.designation;
        worker.skills = req.body.skills || worker.skills;
        worker.experienceYears =
            req.body.experienceYears || worker.experienceYears;

        // ADDRESS
        if (req.body.address) {
            worker.address = JSON.parse(req.body.address);
        }

        await worker.save();

        res.status(200).json({
            success: true,
            message: "Worker updated successfully",
            worker,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// ==========================================
// TOGGLE STATUS
// ==========================================
const toggleWorkerStatus = async (req, res) => {
    try {

        const { workerId } = req.params;

        const worker = await Worker.findOne({
            _id: workerId,
            companyId: req.user._id,
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        worker.isActive = !worker.isActive;

        await worker.save();

        res.status(200).json({
            success: true,
            message: `Worker is now ${worker.isActive ? "Active" : "Inactive"
                }`,
            isActive: worker.isActive,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// DELETE WORKER
// ==========================================
const deleteWorker = async (req, res) => {
    try {

        const { workerId } = req.params;

        const companyId = req.user._id;

        const worker = await Worker.findOne({
            _id: workerId,
            companyId,
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // DELETE WORKER
        await worker.deleteOne();

        // REMOVE FROM COMPANY
        await Company.findByIdAndUpdate(
            companyId,
            {
                $pull: {
                    workers: workerId,
                },

                $inc: {
                    totalWorkers: -1,
                },
            }
        );

        res.status(200).json({
            success: true,
            message: "Worker deleted successfully",
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
    toggleWorkerStatus,
    deleteWorker,
};
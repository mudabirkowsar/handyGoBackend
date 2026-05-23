const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "handygo-documents",
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        // Remove spaces and special chars from filename
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return file.fieldname + '-' + uniqueSuffix;
        }
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
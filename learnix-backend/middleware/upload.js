const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'learnix/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpg, jpeg, png, gif)'));
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: fileFilter
});

// Error handling wrapper
exports.uploadAvatar = (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE / (1024 * 1024)}MB`
                });
            }
            return res.status(400).json({
                success: false,
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }
        next();
    });
};

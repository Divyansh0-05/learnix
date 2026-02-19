const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateProfile,
    uploadAvatar,
    searchUsers,
    getUserStats,
    getUserActivity,
    getRecommendations
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar: avatarUpload } = require('../middleware/upload');

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.get('/:id/stats', getUserStats);
router.get('/:id/activity', getUserActivity);

// Protected routes
router.get('/recommendations', protect, getRecommendations);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, avatarUpload, uploadAvatar);

module.exports = router;

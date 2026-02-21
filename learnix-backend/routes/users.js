const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateProfile,
    uploadAvatar,
    searchUsers,
    getUserStats,
    getUserActivity,
    getRecommendations,
    blockUser,
    unblockUser,
    reportUser
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

// Block & Report routes
router.post('/:id/block', protect, blockUser);
router.delete('/:id/block', protect, unblockUser);
router.post('/:id/report', protect, reportUser);

module.exports = router;

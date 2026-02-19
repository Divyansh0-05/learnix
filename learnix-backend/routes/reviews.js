const express = require('express');
const router = express.Router();
const {
    createReview,
    getUserReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsWritten,
    canReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/user/:userId', getUserReviews);
router.get('/written/:userId', getReviewsWritten);
router.get('/review/:id', getReviewById);

// Protected routes
router.post('/', protect, createReview);
router.get('/can-review/:matchId', protect, canReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

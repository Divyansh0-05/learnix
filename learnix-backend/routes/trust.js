const express = require('express');
const router = express.Router();
const {
    getTrustScore,
    getLeaderboard,
    getTrustHistory,
    getGlobalTrustStats
} = require('../controllers/trustController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/stats/global', getGlobalTrustStats);
router.get('/leaderboard', getLeaderboard);
router.get('/:userId', getTrustScore);

// Protected routes
router.get('/:userId/history', protect, getTrustHistory);

module.exports = router;

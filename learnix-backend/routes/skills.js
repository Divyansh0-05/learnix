const express = require('express');
const router = express.Router();
const {
    addSkill,
    updateSkill,
    deleteSkill,
    getUserSkills,
    searchSkills,
    getTrendingSkills,
    getCategories
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');
const { validateSkill } = require('../middleware/validator');
const { skillLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/search', searchSkills);
router.get('/trending', getTrendingSkills);
router.get('/categories', getCategories);
router.get('/user/:userId', getUserSkills);

// Protected routes
router.post('/', protect, skillLimiter, validateSkill, addSkill);
router.put('/:id', protect, skillLimiter, updateSkill);
router.delete('/:id', protect, skillLimiter, deleteSkill);

module.exports = router;

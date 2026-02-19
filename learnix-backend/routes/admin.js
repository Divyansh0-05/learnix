const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    getUserDetails,
    updateUser,
    banUser,
    unbanUser,
    getReports,
    getReportDetails,
    resolveReport,
    getAllSkills,
    deleteSkill,
    getAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);

// Report management
router.get('/reports', getReports);
router.get('/reports/:id', getReportDetails);
router.put('/reports/:id/resolve', resolveReport);

// Skill management
router.get('/skills', getAllSkills);
router.delete('/skills/:id', deleteSkill);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;

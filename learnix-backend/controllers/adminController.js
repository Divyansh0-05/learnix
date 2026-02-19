const User = require('../models/User');
const Skill = require('../models/Skill');
const Match = require('../models/Match');
const Review = require('../models/Review');
const Report = require('../models/Report');
const { sendNotification } = require('../socket/notificationHandlers');
const logger = require('../utils/logger');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            activeUsers,
            bannedUsers,
            totalSkills,
            totalMatches,
            totalReviews,
            pendingReports,
            recentUsers,
            recentReports,
            skillStats
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true, isBanned: false }),
            User.countDocuments({ isBanned: true }),
            Skill.countDocuments({ isActive: true }),
            Match.countDocuments({ status: 'active' }),
            Review.countDocuments(),
            Report.countDocuments({ status: 'pending' }),
            User.find()
                .select('name email createdAt trustScore isActive isBanned')
                .sort('-createdAt')
                .limit(5),
            Report.find({ status: 'pending' })
                .populate('reporter', 'name')
                .populate('reportedUser', 'name')
                .sort('-createdAt')
                .limit(5),
            Skill.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ])
        ]);

        // Calculate growth stats (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const newUsersLastWeek = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const newMatchesLastWeek = await Match.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsers,
                    bannedUsers,
                    totalSkills,
                    totalMatches,
                    totalReviews,
                    pendingReports,
                    newUsersLastWeek,
                    newMatchesLastWeek
                },
                recentActivity: {
                    users: recentUsers,
                    reports: recentReports
                },
                skillDistribution: skillStats.map(s => ({
                    category: s._id,
                    count: s.count
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            role,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Apply filters
        if (status === 'active') {
            query.isActive = true;
            query.isBanned = false;
        } else if (status === 'banned') {
            query.isBanned = true;
        } else if (status === 'inactive') {
            query.isActive = false;
            query.isBanned = false;
        }

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const users = await User.find(query)
            .select('-password -refreshToken -emailVerificationToken -resetPasswordToken')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalUsers: total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user details for admin
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -refreshToken')
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get user's reports
        const reports = await Report.find({ reportedUser: user._id })
            .populate('reporter', 'name email')
            .sort('-createdAt');

        // Get user's matches
        const matches = await Match.find({
            $or: [{ user1: user._id }, { user2: user._id }]
        })
            .populate('user1', 'name email')
            .populate('user2', 'name email')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                user,
                reports,
                recentMatches: matches
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role, isActive, isBanned, banReason } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (isBanned !== undefined) user.isBanned = isBanned;
        if (banReason) user.banReason = banReason;

        await user.save();

        // Send notification to user if banned/unbanned
        if (isBanned !== undefined) {
            sendNotification(user._id, 'account_status_changed', {
                isBanned: user.isBanned,
                reason: banReason,
                message: user.isBanned
                    ? 'Your account has been suspended'
                    : 'Your account has been reinstated'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Ban user
// @route   POST /api/admin/users/:id/ban
// @access  Private/Admin
exports.banUser = async (req, res, next) => {
    try {
        const { reason, duration } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                error: 'Ban reason is required'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Prevent banning other admins
        if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Cannot ban another admin'
            });
        }

        user.isBanned = true;
        user.isActive = false;
        user.banReason = reason;
        user.bannedAt = new Date();
        if (duration && duration !== 'permanent') {
            // Parse duration (e.g., '7d', '30d', '1y')
            const days = parseInt(duration);
            if (!isNaN(days)) {
                user.banExpiresAt = new Date();
                user.banExpiresAt.setDate(user.banExpiresAt.getDate() + days);
            }
        }

        await user.save();

        // Deactivate all user's skills
        await Skill.updateMany(
            { user: user._id },
            { isActive: false }
        );

        // Send notification
        sendNotification(user._id, 'account_banned', {
            reason,
            duration: duration || 'permanent',
            message: 'Your account has been banned'
        });

        res.status(200).json({
            success: true,
            message: 'User banned successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Unban user
// @route   POST /api/admin/users/:id/unban
// @access  Private/Admin
exports.unbanUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.isBanned = false;
        user.isActive = true;
        user.banReason = undefined;
        user.bannedAt = undefined;
        user.banExpiresAt = undefined;

        await user.save();

        // Reactivate user's skills
        await Skill.updateMany(
            { user: user._id },
            { isActive: true }
        );

        sendNotification(user._id, 'account_unbanned', {
            message: 'Your account has been reinstated'
        });

        res.status(200).json({
            success: true,
            message: 'User unbanned successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            reason,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        if (status) query.status = status;
        if (reason) query.reason = reason;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const reports = await Report.find(query)
            .populate('reporter', 'name email')
            .populate('reportedUser', 'name email')
            .populate('resolvedBy', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Report.countDocuments(query);

        // Get report statistics
        const stats = await Report.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                reports,
                stats: stats.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalReports: total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get report details
// @route   GET /api/admin/reports/:id
// @access  Private/Admin
exports.getReportDetails = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('reporter', 'name email')
            .populate('reportedUser', 'name email')
            .populate('resolvedBy', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        // Get reported user's recent reports
        const userReports = await Report.find({
            reportedUser: report.reportedUser._id,
            _id: { $ne: report._id }
        })
            .populate('reporter', 'name')
            .sort('-createdAt')
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                report,
                userReportHistory: userReports
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Resolve report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private/Admin
exports.resolveReport = async (req, res, next) => {
    try {
        const { status, action, adminNotes } = req.body;

        const report = await Report.findById(req.params.id)
            .populate('reportedUser');

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        report.status = status || 'resolved';
        report.adminNotes = adminNotes;
        report.resolvedBy = req.user._id;
        report.resolvedAt = new Date();

        await report.save();

        // Take action against reported user if needed
        if (action === 'warning') {
            sendNotification(report.reportedUser._id, 'account_warning', {
                reportId: report._id,
                reason: report.reason,
                message: adminNotes || 'Your account has received a warning'
            });
        } else if (action === 'ban') {
            await User.findByIdAndUpdate(report.reportedUser._id, {
                isBanned: true,
                isActive: false,
                banReason: `Reported for: ${report.reason}. ${adminNotes || ''}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Report resolved successfully',
            data: { report }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all skills (admin)
// @route   GET /api/admin/skills
// @access  Private/Admin
exports.getAllSkills = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            category,
            isActive,
            search
        } = req.query;

        const query = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { skillName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const skills = await Skill.find(query)
            .populate('user', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Skill.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                skills,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalSkills: total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete skill (admin)
// @route   DELETE /api/admin/skills/:id
// @access  Private/Admin
exports.deleteSkill = async (req, res, next) => {
    try {
        const skill = await Skill.findById(req.params.id)
            .populate('user');

        if (!skill) {
            return res.status(404).json({
                success: false,
                error: 'Skill not found'
            });
        }

        // Remove from user's arrays
        if (skill.type === 'OFFERED') {
            await User.findByIdAndUpdate(skill.user._id, {
                $pull: { skillsOffered: skill._id }
            });
        } else {
            await User.findByIdAndUpdate(skill.user._id, {
                $pull: { skillsWanted: skill._id }
            });
        }

        // Delete skill
        await skill.deleteOne();

        // Notify user
        sendNotification(skill.user._id, 'skill_removed', {
            skillName: skill.skillName,
            reason: 'Removed by administrator'
        });

        res.status(200).json({
            success: true,
            message: 'Skill deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
    try {
        const { timeframe = 'month' } = req.query;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();

        if (timeframe === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeframe === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (timeframe === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        }

        // User growth
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Match growth
        const matchGrowth = await Match.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Top skills
        const topSkills = await Skill.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$skillName',
                    count: { $sum: 1 },
                    offered: {
                        $sum: { $cond: [{ $eq: ['$type', 'OFFERED'] }, 1, 0] }
                    },
                    wanted: {
                        $sum: { $cond: [{ $eq: ['$type', 'WANTED'] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // User activity
        const userActivity = await User.aggregate([
            {
                $group: {
                    _id: null,
                    avgTrustScore: { $avg: '$trustScore' },
                    avgRating: { $avg: '$averageRating' },
                    usersWithSkills: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: [{ $size: '$skillsOffered' }, 0] },
                                        { $gt: [{ $size: '$skillsWanted' }, 0] }
                                    ]
                                },
                                1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                timeframe,
                userGrowth: formatTimeSeriesData(userGrowth, timeframe),
                matchGrowth: formatTimeSeriesData(matchGrowth, timeframe),
                topSkills,
                userActivity: userActivity[0] || {
                    avgTrustScore: 0,
                    avgRating: 0,
                    usersWithSkills: 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to format time series data
function formatTimeSeriesData(data, timeframe) {
    return data.map(item => {
        let label;
        if (timeframe === 'week') {
            label = `${item._id.year}-${item._id.month}-${item._id.day}`;
        } else if (timeframe === 'month') {
            label = `${item._id.year}-${item._id.month}`;
        } else {
            label = item._id.year.toString();
        }
        return {
            date: label,
            count: item.count
        };
    });
}

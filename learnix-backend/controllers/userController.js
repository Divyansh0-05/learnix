const User = require('../models/User');
const Skill = require('../models/Skill');
const Review = require('../models/Review');
const Match = require('../models/Match');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'skillsOffered',
                match: { isActive: true, type: 'OFFERED' }
            })
            .populate({
                path: 'skillsWanted',
                match: { isActive: true, type: 'WANTED' }
            })
            .select('-password -refreshToken -emailVerificationToken -resetPasswordToken -__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get user stats
        const reviews = await Review.find({ reviewee: user._id })
            .populate('reviewer', 'name avatar')
            .sort('-createdAt')
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    bio: user.bio,
                    avatar: user.avatar,
                    location: user.location,
                    skillsOffered: user.skillsOffered,
                    skillsWanted: user.skillsWanted,
                    trustScore: user.trustScore,
                    averageRating: user.averageRating,
                    totalReviews: user.totalReviews,
                    memberSince: user.createdAt,
                    lastActive: user.lastActive
                },
                recentReviews: reviews
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, bio, location, modePreference } = req.body;

        // Build update object
        const updateFields = {};
        if (name) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;
        if (location) updateFields.location = location;
        if (modePreference) updateFields.modePreference = modePreference;

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            {
                new: true,
                runValidators: true
            }
        ).select('-password -refreshToken');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload an image file'
            });
        }

        // Get Cloudinary URL from uploaded file
        const avatarUrl = req.file.path;

        // Update user avatar
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarUrl },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            data: {
                avatarUrl: user.avatar
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
exports.searchUsers = async (req, res, next) => {
    try {
        const {
            skill,
            category,
            location,
            minRating,
            page = 1,
            limit = 10,
            sortBy = 'trustScore'
        } = req.query;

        // Base query for active users
        const baseQuery = { isActive: true, isBanned: false };

        // First, find skill IDs if searching by skill or category
        let skillIds = [];
        if (skill || category) {
            const skillQuery = { isActive: true };
            if (skill) {
                skillQuery.skillName = { $regex: skill, $options: 'i' };
            }
            if (category) {
                skillQuery.category = category;
            }

            const skills = await Skill.find(skillQuery).select('_id');
            skillIds = skills.map(s => s._id);
        }

        // Build the user query
        const userQuery = { ...baseQuery };

        // Add skill filters if we have skill IDs
        if (skillIds.length > 0) {
            userQuery.$or = [
                { skillsOffered: { $in: skillIds } },
                { skillsWanted: { $in: skillIds } }
            ];
        }

        // Add location filter
        if (location) {
            userQuery['location.city'] = { $regex: location, $options: 'i' };
        }

        // Add rating filter
        if (minRating) {
            userQuery.averageRating = { $gte: parseFloat(minRating) };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort options
        let sort = {};
        if (sortBy === 'rating') sort = { averageRating: -1 };
        else if (sortBy === 'newest') sort = { createdAt: -1 };
        else sort = { trustScore: -1 };

        // Execute search
        const users = await User.find(userQuery)
            .select('-password -refreshToken -emailVerificationToken -resetPasswordToken')
            .populate({
                path: 'skillsOffered',
                match: { isActive: true },
                select: 'skillName category level'
            })
            .populate({
                path: 'skillsWanted',
                match: { isActive: true },
                select: 'skillName category level'
            })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await User.countDocuments(userQuery);

        res.status(200).json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    name: user.name,
                    avatar: user.avatar,
                    bio: user.bio,
                    location: user.location,
                    offeredSkills: user.skillsOffered,
                    wantedSkills: user.skillsWanted,
                    averageRating: user.averageRating,
                    trustScore: user.trustScore,
                    lastActive: user.lastActive
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalResults: total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user stats
// @route   GET /api/users/:id/stats
// @access  Public
exports.getUserStats = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const [
            totalOffered,
            totalWanted,
            totalMatches,
            totalReviews,
            ratingDistribution
        ] = await Promise.all([
            Skill.countDocuments({ user: userId, type: 'OFFERED', isActive: true }),
            Skill.countDocuments({ user: userId, type: 'WANTED', isActive: true }),
            Match.countDocuments({
                $or: [{ user1: userId }, { user2: userId }],
                status: 'active'
            }),
            Review.countDocuments({ reviewee: userId }),
            Review.aggregate([
                { $match: { reviewee: userId } },
                {
                    $group: {
                        _id: '$rating',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } }
            ])
        ]);

        // Format rating distribution
        const distribution = {};
        ratingDistribution.forEach(item => {
            distribution[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            data: {
                totalOffered,
                totalWanted,
                totalMatches,
                totalReviews,
                ratingDistribution: distribution
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user activity feed
// @route   GET /api/users/:id/activity
// @access  Public
exports.getUserActivity = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { limit = 10 } = req.query;

        // Get recent reviews received
        const recentReviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'name avatar')
            .sort('-createdAt')
            .limit(parseInt(limit));

        // Get recent matches
        const recentMatches = await Match.find({
            $or: [{ user1: userId }, { user2: userId }]
        })
            .populate('user1', 'name avatar')
            .populate('user2', 'name avatar')
            .sort('-createdAt')
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                recentReviews,
                recentMatches
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user recommendations
// @route   GET /api/users/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { limit = 5 } = req.query;

        // Get current user's skills
        const currentUser = await User.findById(userId)
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!currentUser.skillsOffered.length || !currentUser.skillsWanted.length) {
            return res.status(400).json({
                success: false,
                error: 'Add skills to get recommendations'
            });
        }

        // Get skill IDs
        const offeredSkillIds = currentUser.skillsOffered.map(s => s._id);
        const wantedSkillIds = currentUser.skillsWanted.map(s => s._id);

        // Find users who want what you offer AND offer what you want
        const recommendations = await User.find({
            _id: { $ne: userId },
            isActive: true,
            isBanned: false,
            skillsWanted: { $in: offeredSkillIds },
            skillsOffered: { $in: wantedSkillIds }
        })
            .select('name avatar bio location trustScore averageRating')
            .populate({
                path: 'skillsOffered',
                match: { _id: { $in: wantedSkillIds } },
                select: 'skillName category level'
            })
            .populate({
                path: 'skillsWanted',
                match: { _id: { $in: offeredSkillIds } },
                select: 'skillName category level'
            })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                recommendations
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Block a user
// @route   POST /api/users/:id/block
// @access  Private
exports.blockUser = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ success: false, error: 'You cannot block yourself' });
        }

        const user = await User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { blockedUsers: targetUserId } },
            { new: true }
        );

        res.status(200).json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Unblock a user
// @route   DELETE /api/users/:id/block
// @access  Private
exports.unblockUser = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        const user = await User.findByIdAndUpdate(
            currentUserId,
            { $pull: { blockedUsers: targetUserId } },
            { new: true }
        );

        res.status(200).json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Report a user
// @route   POST /api/users/:id/report
// @access  Private
exports.reportUser = async (req, res, next) => {
    try {
        const { reason, description } = req.body;
        const reportedUserId = req.params.id;
        const reporterId = req.user.id;

        const Report = require('../models/Report');

        if (reportedUserId === reporterId) {
            return res.status(400).json({ success: false, error: 'You cannot report yourself' });
        }

        const report = await Report.create({
            reporter: reporterId,
            reportedUser: reportedUserId,
            reason,
            description
        });

        res.status(201).json({ success: true, message: 'Report submitted successfully' });
    } catch (error) {
        next(error);
    }
};
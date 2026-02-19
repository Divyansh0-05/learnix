const Skill = require('../models/Skill');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Add new skill
// @route   POST /api/skills
// @access  Private
exports.addSkill = async (req, res, next) => {
    try {
        const { skillName, category, level, type, description, tags } = req.body;

        // Check if skill already exists for user
        const existingSkill = await Skill.findOne({
            user: req.user.id,
            skillName: { $regex: new RegExp(`^${skillName}$`, 'i') },
            type
        });

        if (existingSkill) {
            return res.status(400).json({
                success: false,
                error: `You already have this skill in your ${type.toLowerCase()} list`
            });
        }

        // Create skill
        const skill = await Skill.create({
            user: req.user.id,
            skillName,
            category,
            level,
            type,
            description,
            tags: tags || []
        });

        // Update user's skills array
        if (type === 'OFFERED') {
            await User.findByIdAndUpdate(req.user.id, {
                $push: { skillsOffered: skill._id }
            });
        } else {
            await User.findByIdAndUpdate(req.user.id, {
                $push: { skillsWanted: skill._id }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Skill added successfully',
            data: { skill }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private
exports.updateSkill = async (req, res, next) => {
    try {
        const { level, description, tags, isActive } = req.body;

        // Find skill and verify ownership
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                error: 'Skill not found'
            });
        }

        // Check ownership
        if (skill.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this skill'
            });
        }

        // Update fields
        if (level) skill.level = level;
        if (description !== undefined) skill.description = description;
        if (tags) skill.tags = tags;
        if (isActive !== undefined) skill.isActive = isActive;

        await skill.save();

        res.status(200).json({
            success: true,
            message: 'Skill updated successfully',
            data: { skill }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private
exports.deleteSkill = async (req, res, next) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                error: 'Skill not found'
            });
        }

        // Check ownership
        if (skill.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this skill'
            });
        }

        // Remove from user's arrays
        if (skill.type === 'OFFERED') {
            await User.findByIdAndUpdate(skill.user, {
                $pull: { skillsOffered: skill._id }
            });
        } else {
            await User.findByIdAndUpdate(skill.user, {
                $pull: { skillsWanted: skill._id }
            });
        }

        // Delete skill
        await skill.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Skill deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's skills
// @route   GET /api/skills/user/:userId
// @access  Public
exports.getUserSkills = async (req, res, next) => {
    try {
        const skills = await Skill.find({
            user: req.params.userId,
            isActive: true
        }).sort('-createdAt');

        const offered = skills.filter(s => s.type === 'OFFERED');
        const wanted = skills.filter(s => s.type === 'WANTED');

        res.status(200).json({
            success: true,
            data: {
                offered,
                wanted,
                totalOffered: offered.length,
                totalWanted: wanted.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search skills
// @route   GET /api/skills/search
// @access  Public
exports.searchSkills = async (req, res, next) => {
    try {
        const {
            q,
            category,
            type,
            level,
            page = 1,
            limit = 20
        } = req.query;

        const query = { isActive: true };

        if (q) {
            query.$text = { $search: q };
        }

        if (category) {
            query.category = category;
        }

        if (type) {
            query.type = type;
        }

        if (level) {
            query.level = level;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let skillsQuery = Skill.find(query)
            .populate('user', 'name avatar location trustScore averageRating')
            .sort(q ? { score: { $meta: 'textScore' } } : '-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        if (q) {
            skillsQuery = skillsQuery.sort({ score: { $meta: 'textScore' } });
        }

        const [skills, total] = await Promise.all([
            skillsQuery.exec(),
            Skill.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                skills,
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

// @desc    Get trending skills
// @route   GET /api/skills/trending
// @access  Public
exports.getTrendingSkills = async (req, res, next) => {
    try {
        const { timeframe = 'week', limit = 10 } = req.query;

        // Calculate date range
        const dateRange = new Date();
        if (timeframe === 'week') {
            dateRange.setDate(dateRange.getDate() - 7);
        } else if (timeframe === 'month') {
            dateRange.setMonth(dateRange.getMonth() - 1);
        } else if (timeframe === 'year') {
            dateRange.setFullYear(dateRange.getFullYear() - 1);
        }

        // Aggregate trending skills
        const trending = await Skill.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateRange },
                    isActive: true
                }
            },
            {
                $group: {
                    _id: {
                        skillName: '$skillName',
                        category: '$category'
                    },
                    count: { $sum: 1 },
                    offered: {
                        $sum: { $cond: [{ $eq: ['$type', 'OFFERED'] }, 1, 0] }
                    },
                    wanted: {
                        $sum: { $cond: [{ $eq: ['$type', 'WANTED'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    skillName: '$_id.skillName',
                    category: '$_id.category',
                    totalCount: '$count',
                    offered: 1,
                    wanted: 1,
                    ratio: {
                        $cond: [
                            { $eq: ['$offered', 0] },
                            '$wanted',
                            { $divide: ['$wanted', '$offered'] }
                        ]
                    }
                }
            },
            { $sort: { totalCount: -1 } },
            { $limit: parseInt(limit) }
        ]);

        res.status(200).json({
            success: true,
            data: { trending }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get skill categories
// @route   GET /api/skills/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Skill.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    offered: {
                        $sum: { $cond: [{ $eq: ['$type', 'OFFERED'] }, 1, 0] }
                    },
                    wanted: {
                        $sum: { $cond: [{ $eq: ['$type', 'WANTED'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    count: 1,
                    offered: 1,
                    wanted: 1
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        next(error);
    }
};

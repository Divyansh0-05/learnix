const Match = require('../models/Match');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { findMutualMatches, calculateMatchScore } = require('../utils/matchmaker');
const logger = require('../utils/logger');

// @desc    Find potential matches for current user
// @route   GET /api/matches/find
// @access  Private
exports.findMatches = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { minScore = 50, limit = 20 } = req.query;

        // Get current user with populated skills
        const currentUser = await User.findById(userId)
            .populate('skillsOffered')
            .populate('skillsWanted');

        // Validate user has both offered and wanted skills
        if (!currentUser.skillsOffered?.length || !currentUser.skillsWanted?.length) {
            return res.status(400).json({
                success: false,
                error: 'Please add both offered and wanted skills to find matches'
            });
        }

        // Find users who have mutual skill potential
        const potentialUsers = await User.find({
            _id: { $ne: userId },
            isActive: true,
            isBanned: false,
            skillsOffered: { $exists: true, $not: { $size: 0 } },
            skillsWanted: { $exists: true, $not: { $size: 0 } }
        })
            .populate('skillsOffered')
            .populate('skillsWanted')
            .limit(100); // Limit for performance

        // Calculate matches with scores
        const matchesWithScores = [];

        for (const potentialUser of potentialUsers) {
            // Find mutual skills
            const commonSkills = findMutualMatches(currentUser, potentialUser);

            if (commonSkills.length > 0) {
                // Calculate compatibility score
                const { totalScore, factors } = calculateMatchScore(
                    currentUser,
                    potentialUser,
                    commonSkills
                );

                if (totalScore >= minScore) {
                    matchesWithScores.push({
                        user: potentialUser,
                        matchScore: totalScore,
                        commonSkills,
                        factors
                    });
                }
            }
        }

        // Sort by score and limit
        const sortedMatches = matchesWithScores
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, parseInt(limit));

        // Save or update matches in database and collect their IDs
        const matchIdMap = new Map();
        for (const match of sortedMatches) {
            const savedMatch = await Match.findOneAndUpdate(
                {
                    $or: [
                        { user1: userId, user2: match.user._id },
                        { user1: match.user._id, user2: userId }
                    ]
                },
                {
                    user1: userId,
                    user2: match.user._id,
                    matchScore: match.matchScore,
                    commonSkills: match.commonSkills,
                    status: 'pending',
                    lastInteractionAt: new Date()
                },
                {
                    upsert: true,
                    new: true
                }
            );
            matchIdMap.set(match.user._id.toString(), savedMatch._id);
        }

        // Get existing matches to check request status
        const existingMatches = await Match.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        }).select('user1 user2 status');

        const existingMatchMap = new Map();
        existingMatches.forEach(match => {
            const otherUserId = match.user1.toString() === userId.toString()
                ? match.user2.toString()
                : match.user1.toString();
            existingMatchMap.set(otherUserId, match.status);
        });

        res.status(200).json({
            success: true,
            data: {
                matches: sortedMatches.map(m => ({
                    id: m.user._id,
                    matchId: matchIdMap.get(m.user._id.toString()),
                    matchScore: m.matchScore,
                    user: {
                        id: m.user._id,
                        name: m.user.name,
                        avatar: m.user.avatar,
                        bio: m.user.bio?.substring(0, 150),
                        location: m.user.location,
                        averageRating: m.user.averageRating,
                        trustScore: m.user.trustScore,
                        skillsOffered: m.user.skillsOffered.slice(0, 3),
                        skillsWanted: m.user.skillsWanted.slice(0, 3)
                    },
                    commonSkills: m.commonSkills.map(cs => ({
                        youOffer: cs.user1Offers?.skillName,
                        youOfferLevel: cs.user1Offers?.level,
                        theyWant: cs.user2Wants?.skillName,
                        theyWantLevel: cs.user2Wants?.level,
                        theyOffer: cs.user2Offers?.skillName,
                        theyOfferLevel: cs.user2Offers?.level,
                        youWant: cs.user1Wants?.skillName,
                        youWantLevel: cs.user1Wants?.level
                    })),
                    matchStatus: existingMatchMap.get(m.user._id.toString()) || 'new',
                    scoreBreakdown: m.factors
                })),
                total: sortedMatches.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's matches
// @route   GET /api/matches/my
// @access  Private
exports.getMyMatches = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 20 } = req.query;

        const query = {
            $or: [{ user1: userId }, { user2: userId }]
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const matches = await Match.find(query)
            .populate({
                path: 'user1',
                select: 'name avatar location trustScore averageRating lastActive'
            })
            .populate({
                path: 'user2',
                select: 'name avatar location trustScore averageRating lastActive'
            })
            .populate('commonSkills.user1Offers commonSkills.user2Wants commonSkills.user2Offers commonSkills.user1Wants')
            .sort('-lastInteractionAt')
            .skip(skip)
            .limit(parseInt(limit));

        // Get last message for each match
        const matchesWithLastMessage = await Promise.all(
            matches.map(async (match) => {
                const lastMessage = await Chat.findOne({ match: match._id })
                    .sort('-createdAt')
                    .populate('sender', 'name avatar')
                    .limit(1);

                const otherUser = match.user1._id.toString() === userId.toString()
                    ? match.user2
                    : match.user1;

                return {
                    id: match._id,
                    matchScore: match.matchScore,
                    status: match.status,
                    otherUser: {
                        id: otherUser._id,
                        name: otherUser.name,
                        avatar: otherUser.avatar,
                        location: otherUser.location,
                        trustScore: otherUser.trustScore,
                        averageRating: otherUser.averageRating,
                        lastActive: otherUser.lastActive
                    },
                    commonSkills: match.commonSkills,
                    lastMessage: lastMessage || null,
                    createdAt: match.createdAt,
                    updatedAt: match.updatedAt
                };
            })
        );

        const total = await Match.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                matches: matchesWithLastMessage,
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

// @desc    Get match details
// @route   GET /api/matches/:id
// @access  Private
exports.getMatchDetails = async (req, res, next) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('user1', 'name avatar bio location trustScore averageRating')
            .populate('user2', 'name avatar bio location trustScore averageRating')
            .populate('commonSkills.user1Offers commonSkills.user2Wants commonSkills.user2Offers commonSkills.user1Wants');

        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        // Verify user is part of this match
        const userId = req.user._id.toString();
        if (match.user1._id.toString() !== userId && match.user2._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this match'
            });
        }

        res.status(200).json({
            success: true,
            data: { match }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Block a match
// @route   POST /api/matches/block
// @access  Private
exports.blockMatch = async (req, res, next) => {
    try {
        const { userId, reason } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Find the match
        const match = await Match.findOne({
            $or: [
                { user1: req.user._id, user2: userId },
                { user1: userId, user2: req.user._id }
            ]
        });

        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        // Update match status
        match.status = 'blocked';
        match.blockedBy = req.user._id;
        await match.save();

        res.status(200).json({
            success: true,
            message: 'User blocked successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete/remove match
// @route   DELETE /api/matches/:id
// @access  Private
exports.deleteMatch = async (req, res, next) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        // Verify user is part of this match
        const userId = req.user._id.toString();
        if (match.user1.toString() !== userId && match.user2.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this match'
            });
        }

        // Soft delete - just mark as inactive
        match.status = 'blocked';
        await match.save();

        res.status(200).json({
            success: true,
            message: 'Match removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

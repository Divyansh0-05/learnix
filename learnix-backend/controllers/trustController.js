const User = require('../models/User');
const Review = require('../models/Review');
const Match = require('../models/Match');

// @desc    Get trust score details for a user
// @route   GET /api/trust/:userId
// @access  Public
exports.getTrustScore = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('name email trustScore averageRating totalReviews createdAt isEmailVerified skillsOffered skillsWanted bio avatar location');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Calculate trust score breakdown
        const breakdown = await calculateTrustBreakdown(user);

        // Get recent reviews
        const recentReviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'name avatar')
            .sort('-createdAt')
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                name: user.name,
                trustScore: user.trustScore,
                breakdown,
                recentReviews,
                lastUpdated: user.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get trust score leaderboard
// @route   GET /api/trust/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
    try {
        const { limit = 20, page = 1 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find({
            isActive: true,
            isBanned: false,
            trustScore: { $gt: 0 }
        })
            .select('name avatar trustScore averageRating totalReviews')
            .sort('-trustScore')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments({
            isActive: true,
            isBanned: false,
            trustScore: { $gt: 0 }
        });

        // Add rank
        const usersWithRank = users.map((user, index) => ({
            ...user.toObject(),
            rank: skip + index + 1
        }));

        res.status(200).json({
            success: true,
            data: {
                leaderboard: usersWithRank,
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

// @desc    Get trust score history (for charts)
// @route   GET /api/trust/:userId/history
// @access  Private
exports.getTrustHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Verify user is requesting their own history or is admin
        if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }

        // Get user's review history over time
        const reviews = await Review.find({ reviewee: userId })
            .sort('createdAt')
            .select('rating createdAt');

        // Calculate trust milestones
        const milestones = [];
        let runningTrust = 0;

        // Initial trust (email verified + account creation)
        const user = await User.findById(userId);
        if (user.isEmailVerified) runningTrust += 15;

        reviews.forEach((review, index) => {
            // Add review impact
            runningTrust += Math.min(review.rating * 2, 10);

            milestones.push({
                date: review.createdAt,
                trustScore: Math.min(runningTrust, 100),
                event: `Review #${index + 1} received`,
                rating: review.rating
            });
        });

        res.status(200).json({
            success: true,
            data: {
                currentTrust: user.trustScore,
                history: milestones
            }
        });
    } catch (error) {
        next(error);
    }
};


async function calculateTrustBreakdown(user) {
    const breakdown = {
        emailVerified: { score: user.isEmailVerified ? 15 : 0, max: 15 },
        accountAge: { score: 0, max: 20 },
        profileCompletion: { score: 0, max: 15 },
        skillsAdded: { score: 0, max: 15 },
        reviewsReceived: { score: 0, max: 20 },
        averageRating: { score: 0, max: 15 }
    };

    // Account age
    const accountAgeDays = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
    breakdown.accountAge.score = Math.min(accountAgeDays, 20);

    // Profile completion
    if (user.bio) breakdown.profileCompletion.score += 5;
    if (user.avatar) breakdown.profileCompletion.score += 5;
    if (user.location?.city) breakdown.profileCompletion.score += 5;

    // Skills added
    const skillsCount = (user.skillsOffered?.length || 0) + (user.skillsWanted?.length || 0);
    breakdown.skillsAdded.score = Math.min(skillsCount * 3, 15);

    // Reviews received
    breakdown.reviewsReceived.score = Math.min(user.totalReviews * 2, 20);

    // Average rating
    breakdown.averageRating.score = Math.round(user.averageRating * 3);

    return breakdown;
}

// @desc    Get trust score statistics
// @route   GET /api/trust/stats/global
// @access  Public
exports.getGlobalTrustStats = async (req, res, next) => {
    try {
        const stats = await User.aggregate([
            { $match: { isActive: true, isBanned: false } },
            {
                $group: {
                    _id: null,
                    averageTrustScore: { $avg: '$trustScore' },
                    highestTrustScore: { $max: '$trustScore' },
                    totalUsers: { $sum: 1 },
                    usersWithHighTrust: {
                        $sum: { $cond: [{ $gte: ['$trustScore', 80] }, 1, 0] }
                    },
                    usersWithMediumTrust: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ['$trustScore', 50] },
                                        { $lt: ['$trustScore', 80] }
                                    ]
                                },
                                1, 0
                            ]
                        }
                    },
                    usersWithLowTrust: {
                        $sum: { $cond: [{ $lt: ['$trustScore', 50] }, 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {
                averageTrustScore: 0,
                highestTrustScore: 0,
                totalUsers: 0,
                usersWithHighTrust: 0,
                usersWithMediumTrust: 0,
                usersWithLowTrust: 0
            }
        });
    } catch (error) {
        next(error);
    }
};

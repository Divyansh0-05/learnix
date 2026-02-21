const Review = require('../models/Review');
const User = require('../models/User');
const Match = require('../models/Match');
const { sendNotification } = require('../socket/notificationHandlers');
const logger = require('../utils/logger');

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
    try {
        const { revieweeId, matchId, rating, comment, categories } = req.body;

        // Validation
        if (!revieweeId || !matchId || !rating) {
            return res.status(400).json({
                success: false,
                error: 'Reviewee ID, match ID, and rating are required'
            });
        }

        // Check if rating is valid
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        // Verify match exists and is active
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        // Verify user is part of the match
        const userId = req.user._id.toString();
        const isParticipant = match.user1.toString() === userId || match.user2.toString() === userId;
        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to review this user'
            });
        }

        // Verify reviewee is the other participant
        const otherUserId = match.user1.toString() === userId
            ? match.user2.toString()
            : match.user1.toString();

        if (otherUserId !== revieweeId) {
            return res.status(400).json({
                success: false,
                error: 'Reviewee must be the other participant in the match'
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            reviewer: userId,
            reviewee: revieweeId,
            match: matchId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this user for this match'
            });
        }

        // Create review
        const review = await Review.create({
            reviewer: userId,
            reviewee: revieweeId,
            match: matchId,
            rating,
            comment: comment || '',
            categories: categories || {}
        });

        // Update reviewee's average rating and total reviews
        await updateUserRating(revieweeId);

        // Update trust score
        await updateTrustScore(revieweeId);

        // Populate reviewer info
        await review.populate('reviewer', 'name avatar');

        // Send notification to reviewee
        sendNotification(revieweeId, 'new_review', {
            reviewId: review._id,
            reviewer: {
                id: req.user._id,
                name: req.user.name,
                avatar: req.user.avatar
            },
            rating,
            comment: comment?.substring(0, 100)
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: { review }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, sort = 'recent' } = req.query;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort options
        let sortOption = {};
        if (sort === 'recent') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'rating') {
            sortOption = { rating: -1, createdAt: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        // Get reviews
        const reviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'name avatar')
            .populate('match', 'createdAt')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        // Get rating summary
        const ratingSummary = await Review.aggregate([
            { $match: { reviewee: userId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    rating5: {
                        $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
                    },
                    rating4: {
                        $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] }
                    },
                    rating3: {
                        $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
                    },
                    rating2: {
                        $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] }
                    },
                    rating1: {
                        $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] }
                    }
                }
            }
        ]);

        const total = await Review.countDocuments({ reviewee: userId });

        // Format rating distribution
        const distribution = {};
        if (ratingSummary.length > 0) {
            const summary = ratingSummary[0];
            distribution.average = parseFloat(summary.averageRating.toFixed(1));
            distribution.total = summary.totalReviews;
            distribution.breakdown = {
                5: summary.rating5,
                4: summary.rating4,
                3: summary.rating3,
                2: summary.rating2,
                1: summary.rating1
            };
        } else {
            distribution.average = 0;
            distribution.total = 0;
            distribution.breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        }

        res.status(200).json({
            success: true,
            data: {
                reviews,
                summary: distribution,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalReviews: total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get review by ID
// @route   GET /api/reviews/review/:id
// @access  Public
exports.getReviewById = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('reviewer', 'name avatar')
            .populate('reviewee', 'name avatar')
            .populate('match');

        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { review }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
    try {
        const { rating, comment, categories } = req.body;
        const reviewId = req.params.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        // Check if user is the reviewer
        if (review.reviewer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this review'
            });
        }

        // Check if review is too old to edit (e.g., 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (review.createdAt < sevenDaysAgo) {
            return res.status(400).json({
                success: false,
                error: 'Reviews cannot be edited after 7 days'
            });
        }

        // Update fields
        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    error: 'Rating must be between 1 and 5'
                });
            }
            review.rating = rating;
        }

        if (comment !== undefined) review.comment = comment;
        if (categories) review.categories = categories;

        await review.save();

        // Update user's average rating
        await updateUserRating(review.reviewee);

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: { review }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        // Check if user is the reviewer or admin
        if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this review'
            });
        }

        await review.deleteOne();

        // Update user's average rating
        await updateUserRating(review.reviewee);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews written by user
// @route   GET /api/reviews/written/:userId
// @access  Public
exports.getReviewsWritten = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find({ reviewer: userId })
            .populate('reviewee', 'name avatar')
            .populate('match')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ reviewer: userId });

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalReviews: total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Check if user can review
// @route   GET /api/reviews/can-review/:matchId
// @access  Private
exports.canReview = async (req, res, next) => {
    try {
        const { matchId } = req.params;

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        // Verify user is part of match
        const userId = req.user._id.toString();
        const isParticipant = match.user1.toString() === userId || match.user2.toString() === userId;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }

        // Get other user ID
        const otherUserId = match.user1.toString() === userId
            ? match.user2.toString()
            : match.user1.toString();

        // Check if review already exists
        const existingReview = await Review.findOne({
            reviewer: userId,
            reviewee: otherUserId,
            match: matchId
        });

        res.status(200).json({
            success: true,
            data: {
                canReview: !existingReview,
                hasReviewed: !!existingReview,
                otherUserId
            }
        });
    } catch (error) {
        next(error);
    }
};


async function updateUserRating(userId) {
    try {
        const result = await Review.aggregate([
            { $match: { reviewee: userId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (result.length > 0) {
            await User.findByIdAndUpdate(userId, {
                averageRating: parseFloat(result[0].averageRating.toFixed(1)),
                totalReviews: result[0].totalReviews
            });
        } else {
            await User.findByIdAndUpdate(userId, {
                averageRating: 0,
                totalReviews: 0
            });
        }
    } catch (error) {
        console.error('Error updating user rating:', error);
    }
}


async function updateTrustScore(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        let trustScore = 0;
        const factors = [];

        // Factor 1: Email verified (0-15)
        if (user.isEmailVerified) {
            trustScore += 15;
            factors.push({ factor: 'Email Verified', score: 15 });
        }

        // Factor 2: Account age (0-20)
        const accountAgeDays = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
        const ageScore = Math.min(accountAgeDays, 20);
        trustScore += ageScore;
        factors.push({ factor: 'Account Age', score: ageScore });

        // Factor 3: Profile completion (0-15)
        let profileScore = 0;
        if (user.bio) profileScore += 5;
        if (user.avatar) profileScore += 5;
        if (user.location?.city) profileScore += 5;
        trustScore += profileScore;
        factors.push({ factor: 'Profile Completion', score: profileScore });

        // Factor 4: Skills added (0-15)
        const skillsCount = (user.skillsOffered?.length || 0) + (user.skillsWanted?.length || 0);
        const skillsScore = Math.min(skillsCount * 3, 15);
        trustScore += skillsScore;
        factors.push({ factor: 'Skills Added', score: skillsScore });

        // Factor 5: Reviews received (0-20)
        const reviewScore = Math.min(user.totalReviews * 2, 20);
        trustScore += reviewScore;
        factors.push({ factor: 'Reviews Received', score: reviewScore });

        // Factor 6: Average rating (0-15)
        const ratingScore = Math.round(user.averageRating * 3);
        trustScore += ratingScore;
        factors.push({ factor: 'Average Rating', score: ratingScore });

        // Cap at 100
        trustScore = Math.min(trustScore, 100);

        // Update user
        user.trustScore = trustScore;
        await user.save();

        return { trustScore, factors };
    } catch (error) {
        console.error('Error updating trust score:', error);
    }
}

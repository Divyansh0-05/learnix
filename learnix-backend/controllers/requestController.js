const Request = require('../models/Request');
const Match = require('../models/Match');
const User = require('../models/User');
const { sendNotification } = require('../socket/notificationHandlers');
const { sendEmail } = require('../utils/email');
const { getConnectionRequestTemplate, getRequestAcceptedTemplate } = require('../utils/emailTemplates');
const logger = require('../utils/logger');

// @desc    Send connection request
// @route   POST /api/requests/send
// @access  Private
exports.sendRequest = async (req, res, next) => {
    try {
        const { receiverId, matchId, message } = req.body;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                error: 'Receiver not found'
            });
        }

        // Check if match exists
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        // Verify users are part of the match
        const userId = req.user._id.toString();
        if (match.user1.toString() !== userId && match.user2.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to send request for this match'
            });
        }

        // Check for existing pending request
        const existingRequest = await Request.findOne({
            match: matchId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                error: 'A pending request already exists for this match'
            });
        }

        // Create request
        const request = await Request.create({
            sender: req.user._id,
            receiver: receiverId,
            match: matchId,
            message: message || ''
        });

        // Populate sender info
        await request.populate('sender', 'name avatar');

        // Send real-time notification
        sendNotification(receiverId, 'new_connection_request', {
            requestId: request._id,
            sender: {
                id: req.user._id,
                name: req.user.name,
                avatar: req.user.avatar
            },
            matchId: matchId,
            message: message
        });

        // EMAIL ALERT (Offline only)
        try {
            const { getIO } = require('../socket');
            const io = getIO();
            const recipientRoom = `user:${receiverId}`;
            const sockets = io.sockets.adapter.rooms.get(recipientRoom);
            const isOnline = sockets && sockets.size > 0;

            if (!isOnline) {
                await sendEmail({
                    email: receiver.email,
                    subject: `New Connection Request from ${req.user.name} on Learnix`,
                    message: `${req.user.name} wants to connect with you! "${message || 'No message provided'}"`,
                    html: getConnectionRequestTemplate(`${process.env.CLIENT_URL}/dashboard`, req.user.name, message)
                });
            }
        } catch (emailErr) {
            logger.error('Failed to send offline request email', { error: emailErr.message });
        }

        res.status(201).json({
            success: true,
            message: 'Connection request sent',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept connection request
// @route   PUT /api/requests/:id/accept
// @access  Private
exports.acceptRequest = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        // Verify user is the receiver
        if (request.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to accept this request'
            });
        }

        // Check if request is still pending
        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Request is already ${request.status}`
            });
        }

        // Update request status
        request.status = 'accepted';
        request.respondedAt = new Date();
        await request.save();

        // Update match status to active
        const updatedMatch = await Match.findByIdAndUpdate(request.match, {
            status: 'active',
            lastInteractionAt: new Date()
        }, { new: true })
            .populate('user1', 'name avatar location trustScore averageRating lastActive')
            .populate('user2', 'name avatar location trustScore averageRating lastActive');

        // Force join both users to the match room so they get real-time typing/messages immediately
        const { joinMatchRoom, getIO } = require('../socket');
        const io = getIO();
        joinMatchRoom(request.sender._id, request.match);
        joinMatchRoom(request.receiver._id, request.match);

        // Notify both users that a match is now active
        const matchData = updatedMatch.toObject();
        io.to(`user:${request.sender._id}`).emit('match_activated', { match: matchData });
        io.to(`user:${request.receiver._id}`).emit('match_activated', { match: matchData });

        // Populate data for response
        await request.populate('sender', 'name avatar');
        await request.populate('receiver', 'name avatar');

        // Send notification to sender
        sendNotification(request.sender._id, 'request_accepted', {
            requestId: request._id,
            matchId: request.match,
            receiver: {
                id: req.user._id,
                name: req.user.name
            }
        });

        // EMAIL ALERT (Offline only)
        try {
            const recipientRoom = `user:${request.sender._id}`;
            const sockets = io.sockets.adapter.rooms.get(recipientRoom);
            const isOnline = sockets && sockets.size > 0;

            if (!isOnline) {
                const senderUser = await User.findById(request.sender);
                if (senderUser) {
                    await sendEmail({
                        email: senderUser.email,
                        subject: `Request Accepted! You matched with ${req.user.name}`,
                        message: `Great news! ${req.user.name} accepted your connection request.`,
                        html: getRequestAcceptedTemplate(`${process.env.CLIENT_URL}/chat/${request.match}`, req.user.name)
                    });
                    logger.info(`Offline match email sent to ${senderUser.email}`);
                }
            }
        } catch (emailErr) {
            logger.error('Failed to send offline match email', { error: emailErr.message });
        }

        res.status(200).json({
            success: true,
            message: 'Request accepted',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Decline connection request
// @route   PUT /api/requests/:id/decline
// @access  Private
exports.declineRequest = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        // Verify user is the receiver
        if (request.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to decline this request'
            });
        }

        // Check if request is still pending
        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Request is already ${request.status}`
            });
        }

        // Update request status
        request.status = 'declined';
        request.respondedAt = new Date();
        await request.save();

        // Populate for response
        await request.populate('sender', 'name avatar');

        // Send notification to sender
        sendNotification(request.sender._id, 'request_declined', {
            requestId: request._id,
            matchId: request.match,
            reason: reason
        });

        res.status(200).json({
            success: true,
            message: 'Request declined',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending requests
// @route   GET /api/requests/pending
// @access  Private
exports.getPendingRequests = async (req, res, next) => {
    try {
        const { type = 'received' } = req.query;
        const userId = req.user._id;

        let query = {};
        if (type === 'sent') {
            query.sender = userId;
        } else {
            query.receiver = userId;
        }
        query.status = 'pending';

        const requests = await Request.find(query)
            .populate('sender', 'name avatar location trustScore')
            .populate('receiver', 'name avatar location trustScore')
            .populate({
                path: 'match',
                populate: {
                    path: 'commonSkills.user1Offers commonSkills.user2Wants commonSkills.user2Offers commonSkills.user1Wants'
                }
            })
            .sort('-createdAt');

        let formattedRequests;
        if (type === 'sent') {
            formattedRequests = requests.map(r => ({
                id: r._id,
                receiver: r.receiver,
                match: r.match,
                message: r.message,
                status: r.status,
                createdAt: r.createdAt
            }));
        } else {
            formattedRequests = requests.map(r => ({
                id: r._id,
                sender: r.sender,
                match: r.match,
                message: r.message,
                status: r.status,
                createdAt: r.createdAt
            }));
        }

        res.status(200).json({
            success: true,
            data: {
                [type]: formattedRequests,
                total: requests.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get request history
// @route   GET /api/requests/history
// @access  Private
exports.getRequestHistory = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const requests = await Request.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar')
            .populate('match')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Request.countDocuments({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        res.status(200).json({
            success: true,
            data: {
                requests,
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

// @desc    Cancel sent request
// @route   DELETE /api/requests/:id/cancel
// @access  Private
exports.cancelRequest = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        // Verify user is the sender
        if (request.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to cancel this request'
            });
        }

        // Check if request is still pending
        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel ${request.status} request`
            });
        }

        await request.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Request cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};

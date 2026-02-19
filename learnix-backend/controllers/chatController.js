const Chat = require('../models/Chat');
const Match = require('../models/Match');
const User = require('../models/User');
const { getIO } = require('../socket');
const logger = require('../utils/logger');

// @desc    Get chat history for a match
// @route   GET /api/chat/:matchId
// @access  Private
exports.getChatHistory = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Verify match exists and user is part of it
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        const userId = req.user._id.toString();
        if (match.user1.toString() !== userId && match.user2.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this chat'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await Chat.find({
            match: matchId,
            isDeleted: false
        })
            .populate('sender', 'name avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        // Mark messages as read
        await Chat.updateMany(
            {
                match: matchId,
                sender: { $ne: userId },
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        const total = await Chat.countDocuments({
            match: matchId,
            isDeleted: false
        });

        res.status(200).json({
            success: true,
            data: {
                match: await match.populate('user1 user2', 'name avatar'),
                messages: messages.reverse(), // Return in chronological order
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalMessages: total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send a message (REST fallback)
// @route   POST /api/chat/message
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { matchId, message } = req.body;

        if (!matchId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Match ID and message are required'
            });
        }

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        const userId = req.user._id.toString();
        if (match.user1.toString() !== userId && match.user2.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to send messages in this chat'
            });
        }

        const newMessage = await Chat.create({
            match: matchId,
            sender: userId,
            message: message.trim()
        });

        await newMessage.populate('sender', 'name avatar');

        match.lastInteractionAt = new Date();
        await match.save();

        // Emit via Socket.IO if available
        try {
            const io = getIO();
            io.to(`match:${matchId}`).emit('new_message', newMessage);

            const recipientId = match.user1.toString() === userId
                ? match.user2.toString()
                : match.user1.toString();

            io.to(`user:${recipientId}`).emit('new_message_notification', {
                matchId,
                message: newMessage,
                sender: {
                    id: req.user._id,
                    name: req.user.name,
                    avatar: req.user.avatar
                }
            });
        } catch (socketErr) {
            logger.warn('Socket.IO not available for real-time emit');
        }

        res.status(201).json({
            success: true,
            data: { message: newMessage }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a message
// @route   DELETE /api/chat/:messageId
// @access  Private
exports.deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;

        const message = await Chat.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this message'
            });
        }

        message.isDeleted = true;
        message.deletedBy = req.user._id;
        await message.save();

        try {
            const io = getIO();
            io.to(`match:${message.match}`).emit('message_deleted', {
                messageId: message._id,
                matchId: message.match
            });
        } catch (socketErr) {
            logger.warn('Socket.IO not available for real-time emit');
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:matchId
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const { matchId } = req.params;

        const result = await Chat.updateMany(
            {
                match: matchId,
                sender: { $ne: req.user._id },
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        try {
            const io = getIO();
            io.to(`match:${matchId}`).emit('messages_read', {
                matchId,
                readBy: req.user._id,
                readAt: new Date()
            });
        } catch (socketErr) {
            logger.warn('Socket.IO not available for real-time emit');
        }

        res.status(200).json({
            success: true,
            data: {
                markedAsRead: result.modifiedCount
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread/count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
    try {
        const matches = await Match.find({
            $or: [
                { user1: req.user._id },
                { user2: req.user._id }
            ],
            status: 'active'
        }).select('_id');

        const matchIds = matches.map(m => m._id);

        const unreadCount = await Chat.countDocuments({
            match: { $in: matchIds },
            sender: { $ne: req.user._id },
            isRead: false,
            isDeleted: false
        });

        res.status(200).json({
            success: true,
            data: { unreadCount }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get chat list with last messages
// @route   GET /api/chat/list
// @access  Private
exports.getChatList = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const matches = await Match.find({
            $or: [{ user1: userId }, { user2: userId }],
            status: 'active'
        })
            .populate('user1', 'name avatar lastActive')
            .populate('user2', 'name avatar lastActive')
            .sort('-lastInteractionAt');

        const chatList = await Promise.all(
            matches.map(async (match) => {
                const otherUser = match.user1._id.toString() === userId.toString()
                    ? match.user2
                    : match.user1;

                const lastMessage = await Chat.findOne({
                    match: match._id,
                    isDeleted: false
                })
                    .sort('-createdAt')
                    .populate('sender', 'name avatar');

                const unreadCount = await Chat.countDocuments({
                    match: match._id,
                    sender: { $ne: userId },
                    isRead: false,
                    isDeleted: false
                });

                return {
                    matchId: match._id,
                    otherUser: {
                        id: otherUser._id,
                        name: otherUser.name,
                        avatar: otherUser.avatar,
                        lastActive: otherUser.lastActive
                    },
                    lastMessage: lastMessage ? {
                        id: lastMessage._id,
                        message: lastMessage.message,
                        sender: lastMessage.sender,
                        createdAt: lastMessage.createdAt,
                        isRead: lastMessage.isRead
                    } : null,
                    unreadCount,
                    lastInteractionAt: match.lastInteractionAt
                };
            })
        );

        res.status(200).json({
            success: true,
            data: { chatList }
        });
    } catch (error) {
        next(error);
    }
};

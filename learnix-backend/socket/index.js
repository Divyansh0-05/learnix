const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Match = require('../models/Match');
const Chat = require('../models/Chat');
const logger = require('../utils/logger');

let io;
const userSockets = new Map(); // userId -> Set of socket IDs

exports.initializeSocket = (server) => {
    io = require('socket.io')(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(new Error('User not found'));
            }

            if (user.isBanned) {
                return next(new Error('User is banned'));
            }

            socket.userId = user._id.toString();
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.userId}`);

        // Track connection
        if (!userSockets.has(socket.userId)) {
            userSockets.set(socket.userId, new Set());
            // Broadcast only on first connection
            broadcastStatus(socket, 'online');
        }
        userSockets.get(socket.userId).add(socket.id);

        // Join user to their personal room
        const userRoom = `user:${String(socket.userId)}`;
        socket.join(userRoom);
        logger.info(`Socket ${socket.id} joined personal room ${userRoom}`);

        // Join all active matches for this user
        joinUserMatches(socket);

        // Chat event handlers
        setupChatHandlers(socket);

        // Typing indicators
        setupTypingHandlers(socket);

        // Read receipts
        setupReadReceiptHandlers(socket);

        // Disconnect handler
        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.userId}`);

            const sockets = userSockets.get(socket.userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    userSockets.delete(socket.userId);
                    broadcastStatus(socket, 'offline');
                }
            }
            handleDisconnect(socket);
        });

        // Error handler
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};


async function joinUserMatches(socket) {
    try {
        const matches = await Match.find({
            $or: [
                { user1: socket.userId },
                { user2: socket.userId }
            ],
            status: 'active'
        }).select('_id user1 user2');

        matches.forEach(match => {
            socket.join(`match:${match._id}`);
        });

        const onlinePartnerIds = matches
            .map(m => {
                const id1 = m.user1._id?.toString() || m.user1.toString();
                const id2 = m.user2._id?.toString() || m.user2.toString();
                return String(id1) === String(socket.userId) ? String(id2) : String(id1);
            })
            .filter(partnerId => userSockets.has(partnerId));

        socket.emit('joined_matches', {
            count: matches.length,
            matchIds: matches.map(m => m._id),
            onlineUsers: onlinePartnerIds
        });
    } catch (error) {
        console.error('Error joining matches:', error);
    }
}

// Setup chat event handlers
function setupChatHandlers(socket) {
    // Join specific match room
    socket.on('join_match', async (matchId) => {
        try {
            const match = await Match.findById(matchId);

            if (!match) {
                return socket.emit('error', { message: 'Match not found' });
            }

            const isParticipant =
                match.user1.toString() === socket.userId ||
                match.user2.toString() === socket.userId;

            if (!isParticipant) {
                return socket.emit('error', { message: 'Not authorized' });
            }

            socket.join(`match:${matchId}`);
            socket.emit('joined_match', { matchId });
        } catch (error) {
            socket.emit('error', { message: 'Failed to join match' });
        }
    });

    // Leave match room
    socket.on('leave_match', (matchId) => {
        socket.leave(`match:${matchId}`);
        socket.emit('left_match', { matchId });
    });

    // Send message
    socket.on('send_message', async (data) => {
        try {
            const { matchId, message, tempId } = data;

            if (!matchId || !message) {
                return socket.emit('error', { message: 'Match ID and message are required' });
            }

            const match = await Match.findById(matchId);
            if (!match) {
                return socket.emit('error', { message: 'Match not found' });
            }

            const isParticipant =
                match.user1.toString() === socket.userId ||
                match.user2.toString() === socket.userId;

            if (!isParticipant) {
                return socket.emit('error', { message: 'Not authorized' });
            }

            // Save message to database
            const newMessage = await Chat.create({
                match: matchId,
                sender: socket.userId,
                message: message.trim()
            });

            await newMessage.populate('sender', 'name avatar');

            // Update match last interaction (atomic)
            await Match.findByIdAndUpdate(matchId, {
                lastInteractionAt: new Date()
            });

            const messageObj = newMessage.toObject();

            // Emit to match room
            io.to(`match:${matchId}`).emit('new_message', { ...messageObj, tempId });

            const recipientId = match.user1.toString() === socket.userId
                ? match.user2.toString()
                : match.user1.toString();

            // Emit notification to specific user
            io.to(`user:${recipientId}`).emit('new_message_notification', {
                matchId: String(matchId),
                message: messageObj
            });

            try {
                const recipientRoom = `user:${recipientId}`;
                const sockets = io.sockets.adapter.rooms.get(recipientRoom);
                const isOnline = sockets && sockets.size > 0;

                if (!isOnline) {
                    const messageCount = await Chat.countDocuments({ match: matchId });
                    if (messageCount === 1) {
                        const recipient = await User.findById(recipientId);
                        const { sendEmail } = require('../utils/email');

                        await sendEmail({
                            email: recipient.email,
                            subject: `New Message from ${socket.user.name} on Learnix`,
                            message: `You have a new message from ${socket.user.name}: "${message.trim()}"`,
                            html: `
                                <div style="font-family: sans-serif; color: #333;">
                                    <h2>New Message!</h2>
                                    <p><strong>${socket.user.name}</strong> sent you a message on Learnix.</p>
                                    <blockquote style="border-left: 4px solid #ddd; padding-left: 10px; color: #666;">
                                        ${message.trim()}
                                    </blockquote>
                                    <p>Log in to reply and continue the conversation.</p>
                                    <a href="${process.env.CLIENT_URL}/chat/${matchId}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Reply Now</a>
                                </div>
                            `
                        });
                        logger.info(`Offline message email sent to ${recipient.email}`);
                    }
                }
            } catch (emailErr) {
                logger.error('Failed to send offline message email', { error: emailErr.message });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', {
                message: 'Failed to send message',
                tempId: data.tempId
            });
        }
    });

    // Delete message
    socket.on('delete_message', async (data) => {
        try {
            const { messageId } = data;

            const message = await Chat.findById(messageId);
            if (!message) {
                return socket.emit('error', { message: 'Message not found' });
            }

            if (message.sender.toString() !== socket.userId) {
                return socket.emit('error', { message: 'Not authorized' });
            }

            message.isDeleted = true;
            message.deletedBy = socket.userId;
            await message.save();

            io.to(`match:${message.match}`).emit('message_deleted', {
                messageId: message._id,
                matchId: message.match
            });

        } catch (error) {
            console.error('Error deleting message:', error);
            socket.emit('error', { message: 'Failed to delete message' });
        }
    });
}

// Setup typing indicators
function setupTypingHandlers(socket) {
    socket.on('typing', async (data) => {
        const matchId = String(data.matchId);
        const { isTyping } = data;

        try {
            const match = await Match.findById(matchId);
            if (!match) return;

            const isParticipant =
                match.user1.toString() === socket.userId ||
                match.user2.toString() === socket.userId;

            if (!isParticipant) return;

            const recipientId = match.user1.toString() === socket.userId
                ? match.user2.toString()
                : match.user1.toString();

            const payload = {
                matchId: String(matchId),
                userId: socket.userId,
                isTyping
            };

            // Broadcast to the match room (for those currently in the chat)
            socket.to(`match:${matchId}`).emit('user_typing', payload);

            // Emit to the recipient's personal room (for the sidebar/WhatsApp-style)
            io.to(`user:${recipientId}`).emit('user_typing', payload);

        } catch (error) {
            console.error('Error handling typing:', error);
        }
    });
}

// Setup read receipts
function setupReadReceiptHandlers(socket) {
    socket.on('mark_read', async (data) => {
        try {
            const { matchId } = data;

            const result = await Chat.updateMany(
                {
                    match: matchId,
                    sender: { $ne: socket.userId },
                    isRead: false
                },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date()
                    }
                }
            );

            if (result.modifiedCount > 0) {
                const match = await Match.findById(matchId);
                const otherUserId = match.user1.toString() === socket.userId
                    ? match.user2.toString()
                    : match.user1.toString();

                io.to(`user:${otherUserId}`).emit('messages_read', {
                    matchId,
                    readBy: socket.userId,
                    readAt: new Date(),
                    count: result.modifiedCount
                });

                io.to(`match:${matchId}`).emit('messages_read', {
                    matchId,
                    readBy: socket.userId,
                    readAt: new Date()
                });
            }

        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });
}

// Broadcast status to all matches
async function broadcastStatus(socket, status) {
    try {
        const matches = await Match.find({
            $or: [
                { user1: socket.userId },
                { user2: socket.userId }
            ],
            status: 'active'
        }).select('_id');

        matches.forEach(match => {
            // Use socket.to instead of io.to to avoid sending to the user themselves
            // although they might want to know they are "online" too for UI sync
            io.to(`match:${match._id}`).emit('user_status', {
                userId: socket.userId,
                status: status,
                timestamp: new Date()
            });
        });
    } catch (error) {
        console.error('Error broadcasting status:', error);
    }
}

// Handle disconnect
function handleDisconnect(socket) {
    User.findByIdAndUpdate(socket.userId, {
        lastActive: new Date()
    }).catch(err => console.error('Error updating last active:', err));
}

// Help user's sockets join a match room (useful when match becomes active)
exports.joinMatchRoom = (userId, matchId) => {
    if (!io) return;
    const userIdStr = String(userId);
    const matchIdStr = String(matchId);
    // This joins all sockets in the user's personal room to the match room
    io.in(`user:${userIdStr}`).socketsJoin(`match:${matchIdStr}`);
    logger.info(`Force joined all sockets for User ${userIdStr} to room match:${matchIdStr}`);
};


exports.getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

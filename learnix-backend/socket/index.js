const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Match = require('../models/Match');
const Chat = require('../models/Chat');

let io;

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
        console.log(`User connected: ${socket.userId}`);

        // Join user to their personal room
        socket.join(`user:${socket.userId}`);

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
            console.log(`User disconnected: ${socket.userId}`);
            handleDisconnect(socket);
        });

        // Error handler
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};

// Helper function to join user's active matches
async function joinUserMatches(socket) {
    try {
        const matches = await Match.find({
            $or: [
                { user1: socket.userId },
                { user2: socket.userId }
            ],
            status: 'active'
        }).select('_id');

        matches.forEach(match => {
            socket.join(`match:${match._id}`);
        });

        socket.emit('joined_matches', {
            count: matches.length,
            matchIds: matches.map(m => m._id)
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

            // Update match last interaction
            match.lastInteractionAt = new Date();
            await match.save();

            // Emit to match room
            io.to(`match:${matchId}`).emit('new_message', {
                ...newMessage.toObject(),
                tempId
            });

            // Notify other user
            const recipientId = match.user1.toString() === socket.userId
                ? match.user2.toString()
                : match.user1.toString();

            io.to(`user:${recipientId}`).emit('new_message_notification', {
                matchId,
                message: {
                    id: newMessage._id,
                    text: newMessage.message.substring(0, 50),
                    sender: {
                        id: socket.userId,
                        name: socket.user.name
                    }
                },
                timestamp: newMessage.createdAt
            });

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
        const { matchId, isTyping } = data;

        try {
            const match = await Match.findById(matchId);
            if (!match) return;

            const isParticipant =
                match.user1.toString() === socket.userId ||
                match.user2.toString() === socket.userId;

            if (!isParticipant) return;

            socket.to(`match:${matchId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping
            });

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

// Handle disconnect
function handleDisconnect(socket) {
    User.findByIdAndUpdate(socket.userId, {
        lastActive: new Date()
    }).catch(err => console.error('Error updating last active:', err));
}

// Helper to get IO instance
exports.getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

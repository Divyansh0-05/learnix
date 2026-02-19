const { getIO } = require('./index');

// Send notification to specific user
exports.sendNotification = (userId, event, data) => {
    try {
        const io = getIO();
        io.to(`user:${userId}`).emit(event, data);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

// Broadcast to all users in a match
exports.broadcastToMatch = (matchId, event, data) => {
    try {
        const io = getIO();
        io.to(`match:${matchId}`).emit(event, data);
    } catch (error) {
        console.error('Error broadcasting to match:', error);
    }
};

// Send typing indicator
exports.sendTypingIndicator = (matchId, userId, isTyping) => {
    try {
        const io = getIO();
        io.to(`match:${matchId}`).emit('user_typing', {
            userId,
            isTyping
        });
    } catch (error) {
        console.error('Error sending typing indicator:', error);
    }
};

// Notify about new match
exports.notifyNewMatch = (userId, matchData) => {
    try {
        const io = getIO();
        io.to(`user:${userId}`).emit('new_match', matchData);
    } catch (error) {
        console.error('Error notifying new match:', error);
    }
};

// Notify about request updates
exports.notifyRequestUpdate = (userId, requestData) => {
    try {
        const io = getIO();
        io.to(`user:${userId}`).emit('request_update', requestData);
    } catch (error) {
        console.error('Error notifying request update:', error);
    }
};

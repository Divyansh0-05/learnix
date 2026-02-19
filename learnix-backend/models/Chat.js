const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Message cannot be empty'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

ChatSchema.index({ match: 1, createdAt: -1 });
ChatSchema.index({ match: 1, isRead: 1 });

module.exports = mongoose.model('Chat', ChatSchema);

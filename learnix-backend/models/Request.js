const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: 500
    },
    respondedAt: Date
}, {
    timestamps: true
});

RequestSchema.index({ sender: 1, receiver: 1 });
RequestSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('Request', RequestSchema);

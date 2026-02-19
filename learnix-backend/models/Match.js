const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    commonSkills: [{
        user1Offers: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        },
        user2Wants: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        },
        user2Offers: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        },
        user1Wants: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'active', 'blocked'],
        default: 'pending'
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastInteractionAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure unique matches
MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });
MatchSchema.index({ matchScore: -1 });
MatchSchema.index({ status: 1 });

module.exports = mongoose.model('Match', MatchSchema);

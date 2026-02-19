const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500
    },
    categories: {
        communication: {
            type: Number,
            min: 1,
            max: 5
        },
        punctuality: {
            type: Number,
            min: 1,
            max: 5
        },
        skillLevel: {
            type: Number,
            min: 1,
            max: 5
        }
    }
}, {
    timestamps: true
});

ReviewSchema.index({ reviewer: 1, reviewee: 1, match: 1 }, { unique: true });
ReviewSchema.index({ reviewee: 1 });

module.exports = mongoose.model('Review', ReviewSchema);

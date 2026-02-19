const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: [
            'inappropriate_behavior',
            'fake_profile',
            'spam',
            'harassment',
            'no_show',
            'skill_misrepresentation',
            'other'
        ]
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'dismissed'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        maxlength: 1000
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date
}, {
    timestamps: true
});

ReportSchema.index({ reportedUser: 1 });
ReportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', ReportSchema);

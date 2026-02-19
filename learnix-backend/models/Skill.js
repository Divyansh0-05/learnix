const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillName: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Programming',
            'Design',
            'Music',
            'Language',
            'Cooking',
            'Fitness',
            'Photography',
            'Writing',
            'Business',
            'Marketing',
            'Other'
        ]
    },
    level: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'expert']
    },
    type: {
        type: String,
        required: true,
        enum: ['OFFERED', 'WANTED']
    },
    description: {
        type: String,
        maxlength: [300, 'Description cannot exceed 300 characters']
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate skill entries
SkillSchema.index({ user: 1, skillName: 1, type: 1 }, { unique: true });
SkillSchema.index({ category: 1 });
SkillSchema.index({ skillName: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Skill', SkillSchema);

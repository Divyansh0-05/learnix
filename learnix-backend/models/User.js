const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    skillsOffered: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    skillsWanted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    location: {
        city: String,
        country: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    modePreference: {
        type: String,
        enum: ['online', 'offline', 'both'],
        default: 'both'
    },
    trustScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
    refreshTokenExpires: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add middleware to hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Add method to generate JWT
UserSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Add method to generate refresh token
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );
};

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ 'location.city': 1 });
UserSchema.index({ trustScore: -1 });
UserSchema.index({ averageRating: -1 });

module.exports = mongoose.model('User', UserSchema);

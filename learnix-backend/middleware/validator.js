const { body, validationResult } = require('express-validator');

// Validation rules for registration
exports.validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

// Validation rules for login
exports.validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

// Validation for skills
exports.validateSkill = [
    body('skillName')
        .trim()
        .notEmpty().withMessage('Skill name is required')
        .isLength({ max: 50 }).withMessage('Skill name cannot exceed 50 characters'),

    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn([
            'Programming', 'Design', 'Music', 'Language', 'Cooking',
            'Fitness', 'Photography', 'Writing', 'Business', 'Marketing', 'Other'
        ]).withMessage('Invalid category'),

    body('level')
        .notEmpty().withMessage('Level is required')
        .isIn(['beginner', 'intermediate', 'expert']).withMessage('Invalid level'),

    body('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['OFFERED', 'WANTED']).withMessage('Invalid type'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
        .custom(tags => tags.every(tag => typeof tag === 'string' && tag.length <= 20))
        .withMessage('Each tag must be a string and not exceed 20 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies (if using cookies)
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Check if user is banned
            if (user.isBanned) {
                return res.status(403).json({
                    success: false,
                    error: 'Account has been banned',
                    reason: user.banReason
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    error: 'Account is inactive'
                });
            }

            // Update last active timestamp (don't await to avoid blocking)
            user.lastActive = Date.now();
            user.save({ validateBeforeSave: false }).catch(err =>
                console.error('Error updating lastActive:', err)
            );

            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired'
                });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Authorize based on user roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Optional auth - doesn't require token but attaches user if present
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                if (user && !user.isBanned && user.isActive) {
                    req.user = user;
                }
            } catch (error) {
                // Ignore token errors for optional auth
            }
        }
        next();
    } catch (error) {
        next();
    }
};

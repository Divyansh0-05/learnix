const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../utils/redis');

// General API rate limiter
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis store if available and connected
    ...(redisClient && typeof redisClient.getIsConnected === 'function' && redisClient.getIsConnected() ? {
        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
        })
    } : {})
});

// Stricter rate limiter for authentication
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful attempts
    message: {
        success: false,
        error: 'Too many login attempts. Please try again later.'
    }
});

// Rate limiter for skill operations
exports.skillLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Max 50 skill operations per hour
    message: {
        success: false,
        error: 'Skill operation limit reached. Please try again later.'
    }
});

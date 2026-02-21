const { createClient } = require('redis');
const logger = require('./logger');

let isConnected = false;
let hasLoggedError = false;

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                if (!hasLoggedError) {
                    logger.warn('Redis is unavailable after 5 attempts. Running without Redis.');
                    hasLoggedError = true;
                }
                return false; // Stop reconnecting after 5 attempts
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        if (!hasLoggedError) {
            logger.warn('Redis connection refused. Running without Redis.');
            hasLoggedError = true;
        }
    } else {
        logger.error('Redis Client Error', err);
    }
    isConnected = false;
});

redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
    isConnected = true;
});

redisClient.on('ready', () => {
    isConnected = true;
});

redisClient.on('end', () => {
    isConnected = false;
});

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        // Error will be handled by the 'error' event listener
        isConnected = false;
    }
})();


redisClient.getIsConnected = () => isConnected;

module.exports = redisClient;
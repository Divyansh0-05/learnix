const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { initializeSocket } = require('./socket');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO (handles auth, chat, typing, read receipts)
const io = initializeSocket(server);

// Make io available to routes if needed
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '5mb' }));
app.use(morgan('dev'));

// Rate Limiting
// const limiter = rateLimit({
//     windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
//     max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use(limiter);

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/skills', require('./routes/skills'));
app.use('/api/v1/matches', require('./routes/matches'));
app.use('/api/v1/requests', require('./routes/requests'));
app.use('/api/v1/chat', require('./routes/chat'));
app.use('/api/v1/reviews', require('./routes/reviews'));
app.use('/api/v1/trust', require('./routes/trust'));

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error',
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

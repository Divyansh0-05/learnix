const express = require('express');
const router = express.Router();
const {
    getChatHistory,
    sendMessage,
    deleteMessage,
    markAsRead,
    getUnreadCount,
    getChatList
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes are protected
router.use(protect);

router.get('/list', getChatList);
router.get('/unread/count', getUnreadCount);
router.get('/:matchId', getChatHistory);
router.post('/message', sendMessage);
router.put('/read/:matchId', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;

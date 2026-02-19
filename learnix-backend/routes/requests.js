const express = require('express');
const router = express.Router();
const {
    sendRequest,
    acceptRequest,
    declineRequest,
    getPendingRequests,
    getRequestHistory,
    cancelRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

// All request routes are protected
router.use(protect);

router.post('/send', sendRequest);
router.get('/pending', getPendingRequests);
router.get('/history', getRequestHistory);
router.put('/:id/accept', acceptRequest);
router.put('/:id/decline', declineRequest);
router.delete('/:id/cancel', cancelRequest);

module.exports = router;

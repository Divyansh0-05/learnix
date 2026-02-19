const express = require('express');
const router = express.Router();
const {
    findMatches,
    getMyMatches,
    getMatchDetails,
    blockMatch,
    deleteMatch
} = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

// All match routes are protected
router.use(protect);

router.get('/find', findMatches);
router.get('/my', getMyMatches);
router.get('/:id', getMatchDetails);
router.post('/block', blockMatch);
router.delete('/:id', deleteMatch);

module.exports = router;

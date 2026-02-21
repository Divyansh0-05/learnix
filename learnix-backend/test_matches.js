const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Match = require('./models/Match');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const matches = await Match.find({ status: 'active' }).populate('user1 user2').lean();
        console.log('Matches length:', matches.length);
        if (matches.length > 0) {
            matches.forEach(m => {
                console.log('Match ID:', m._id);
                console.log('user1 exists:', !!m.user1, m.user1?.name);
                console.log('user2 exists:', !!m.user2, m.user2?.name);
            });
        }
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
});

const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Match = require('./models/Match');
const Request = require('./models/Request');

async function fixDB() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Find all accepted requests
    const acceptedRequests = await Request.find({ status: 'accepted' });
    console.log(`Found ${acceptedRequests.length} accepted requests.`);

    let fixed = 0;
    for (const req of acceptedRequests) {
        // Force the Match to be active
        const result = await Match.updateOne({ _id: req.match }, { $set: { status: 'active' } });
        if (result.modifiedCount > 0) fixed++;
    }

    console.log(`Fixed ${fixed} matches to active status.`);
    process.exit(0);
}

fixDB().catch(console.error);

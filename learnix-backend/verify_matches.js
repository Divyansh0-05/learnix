const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/.env' });
const Match = require('./models/Match');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);

    const matches = await Match.find({}).lean();
    let out = 'Total matches count: ' + matches.length + '\n';
    for (const match of matches) {
        out += `Match ${match._id}: status=${match.status} user1=${match.user1} user2=${match.user2}\n`;
    }

    fs.writeFileSync('match_dump.txt', out);
    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});

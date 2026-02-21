const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Skill = require('../models/Skill');
const Match = require('../models/Match');
const Request = require('../models/Request');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Cleanup'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const clearSeedData = async () => {
    try {
        console.log('Initiating Seeded Data Cleanup...');

        const seededEmails = [
            'alice@test.com',
            'bob@test.com',
            'charlie@marketing.com'
        ];

        for (const email of seededEmails) {
            const user = await User.findOne({ email });
            if (user) {
                console.log(`Found seeded user: ${user.name} (${email})`);

                // Delete their skills
                const skillDel = await Skill.deleteMany({ user: user._id });
                console.log(`- Deleted ${skillDel.deletedCount} skills`);

                // Delete Matches involving them
                if (Match) {
                    const matchDel = await Match.deleteMany({ users: user._id });
                    console.log(`- Deleted ${matchDel.deletedCount} matches`);
                }

                // Delete Requests involving them
                if (Request) {
                    const reqDel = await Request.deleteMany({
                        $or: [{ requester: user._id }, { recipient: user._id }]
                    });
                    console.log(`- Deleted ${reqDel.deletedCount} requests`);
                }

                // Delete User
                await User.deleteOne({ _id: user._id });
                console.log(`- Deleted user ${user.name} successfully.`);
            } else {
                console.log(`User ${email} not found.`);
            }
        }

        console.log('\nCleanup Complete!');
        process.exit();
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
};

clearSeedData();

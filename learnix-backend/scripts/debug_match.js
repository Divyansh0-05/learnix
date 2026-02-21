const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { findMutualMatches } = require('../utils/matchmaker');

// Load env
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Require models
const User = require('../models/User');
const Skill = require('../models/Skill');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const debugMatch = async () => {
    try {
        console.log('Debugging Match Logic...');

        // 1. Find Charlie
        const charlie = await User.findOne({ email: 'charlie@marketing.com' })
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!charlie) {
            console.log('Charlie not found!');
            process.exit();
        }

        // 2. Find YOU (the logged in user). I'll just pick the first user who ISN'T Charlie/Alice/Bob
        const user = await User.findOne({
            email: { $nin: ['charlie@marketing.com', 'alice@test.com', 'bob@test.com'] }
        })
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!user) {
            console.log('User not found!');
            process.exit();
        }

        console.log(`\nChecking Match between:`);
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`  Offers: ${user.skillsOffered.map(s => `${s.skillName} (${s.category})`).join(', ')}`);
        console.log(`  Wants: ${user.skillsWanted.map(s => `${s.skillName} (${s.category})`).join(', ')}`);

        console.log(`\nTarget: ${charlie.name} (${charlie.email})`);
        console.log(`  Offers: ${charlie.skillsOffered.map(s => `${s.skillName} (${s.category})`).join(', ')}`);
        console.log(`  Wants: ${charlie.skillsWanted.map(s => `${s.skillName} (${s.category})`).join(', ')}`);

        console.log('\n--- Running findMutualMatches ---');
        const commonSkills = findMutualMatches(user, charlie);
        console.log(`Result: ${commonSkills.length} matches found.`);

        if (commonSkills.length > 0) {
            console.log(JSON.stringify(commonSkills, null, 2));
        } else {
            console.log('WHY NO MATCH?');
            // Manual Check
            user.skillsOffered.forEach(offered => {
                charlie.skillsWanted.forEach(wanted => {
                    console.log(`Comparing User Offer "${offered.skillName}" vs Charlie Wants "${wanted.skillName}"`);
                    console.log(`  - Name Match: ${offered.skillName.toLowerCase() === wanted.skillName.toLowerCase()}`);
                    console.log(`  - Category Match: ${offered.category === wanted.category} ("${offered.category}" vs "${wanted.category}")`);
                });
            });
        }

        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugMatch();

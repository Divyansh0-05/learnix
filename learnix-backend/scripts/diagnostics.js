const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { findMutualMatches, calculateMatchScore } = require('../utils/matchmaker');

// Load env
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Require models
const User = require('../models/User');
const Skill = require('../models/Skill');
const Match = require('../models/Match');
const Request = require('../models/Request');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const runDiagnostics = async () => {
    try {
        console.log('--- DIAGNOSTICS START ---\n');

        // 1. Get Charlie
        const charlie = await User.findOne({ email: 'charlie@marketing.com' })
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!charlie) {
            console.log('ERROR: Charlie not found!');
            process.exit();
        }
        console.log(`Target: ${charlie.name} (${charlie.email})`);
        console.log('  Offers:');
        charlie.skillsOffered.forEach(s => console.log(`    - "${s.skillName}" [${s.category}]`));
        console.log('  Wants:');
        charlie.skillsWanted.forEach(s => console.log(`    - "${s.skillName}" [${s.category}]`));

        // 2. Get User (Anyone NOT Charlie/Alice/Bob)
        const user = await User.findOne({
            email: { $nin: ['charlie@marketing.com', 'alice@test.com', 'bob@test.com'] }
        })
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!user) {
            console.log('ERROR: User not found!');
            process.exit();
        }
        console.log(`\nUser: ${user.name} (${user.email})`);
        console.log('  Offers:');
        user.skillsOffered.forEach(s => console.log(`    - "${s.skillName}" [${s.category}]`));
        console.log('  Wants:');
        user.skillsWanted.forEach(s => console.log(`    - "${s.skillName}" [${s.category}]`));

        // 3. Clean Slate (Optional: Remove old matches to force re-calc)
        console.log('\n--- CLEANING STALE DATA ---');
        await Match.deleteMany({ $or: [{ user1: user._id }, { user2: user._id }] });
        await Request.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });
        console.log('Deleted all Matches and Requests for user correctly.');

        // 4. Run Match Logic
        console.log('\n--- MATCH SIMULATION ---');
        const commonSkills = findMutualMatches(user, charlie);
        console.log(`Mutual Skills Found: ${commonSkills.length}`);

        if (commonSkills.length > 0) {
            const { totalScore } = calculateMatchScore(user, charlie, commonSkills);
            console.log(`Match Score: ${totalScore}`);

            if (totalScore >= 10) {
                console.log('✅ SUCCESS: Match Should Appear via findMatches()');
            } else {
                console.log(`❌ FAIL: Score too low (${totalScore} < 10)`);
            }
        } else {
            console.log('❌ FAIL: No Mutual Skills Found via findMutualMatches()');
            // Debug failure
            console.log('Detailed Check:');
            user.skillsOffered.forEach(offered => {
                charlie.skillsWanted.forEach(wanted => {
                    const offeredName = offered.skillName.toLowerCase();
                    const wantedName = wanted.skillName.toLowerCase();
                    const match = (offeredName.includes(wantedName) || wantedName.includes(offeredName)) &&
                        offered.category === wanted.category;
                    console.log(`  User Offer "${offered.skillName}" vs Charlie Wants "${wanted.skillName}": ${match ? 'MATCH' : 'NO MATCH'}`);
                    if (!match) {
                        console.log(`    Name Includes: ${offeredName.includes(wantedName) || wantedName.includes(offeredName)}`);
                        console.log(`    Category Equal: ${offered.category === wanted.category} ("${offered.category}" vs "${wanted.category}")`);
                    }
                });
            });
        }

        console.log('\n--- DIAGNOSTICS END ---');
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runDiagnostics();

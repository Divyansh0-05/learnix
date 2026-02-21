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

const runTargetedDiagnostics = async () => {
    try {
        console.log('--- TARGETED DIAGNOSTICS FOR CHAT TESTER 2 ---\n');

        // 1. Get Chat Tester 2
        // Try finding by name first, or fallback to any "tester" that isn't Charlie/Alice/Bob
        const user = await User.findOne({ name: 'Chat Tester 2' })
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!user) {
            console.log('ERROR: Chat Tester 2 not found!');
            // Fallback: check db dump output to find email?
            // "tester2@test.com"
            const userFallback = await User.findOne({ email: 'tester2@test.com' })
                .populate('skillsOffered')
                .populate('skillsWanted');
            if (userFallback) {
                console.log('Found tester2@test.com (Is name wrong?)');
            } else {
                console.log('Total Failure: neither Name nor Email worked.');
                process.exit();
            }
        } else {
            console.log(`User: ${user.name} (${user.email}) [ID: ${user._id}]`);
        }

        // 2. Get Charlie Universal
        const charlie = await User.findOne({ email: 'charlie@marketing.com' })
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!charlie) {
            console.log('ERROR: Charlie Universal not found!');
            process.exit();
        }
        console.log(`Target: ${charlie.name} (${charlie.email}) [ID: ${charlie._id}]`);

        // 3. Simulate "Exclusion Logic" (findMatches controller logic)
        // Get existing matches involving User
        const existingMatches = await Match.find({
            $or: [{ user1: user._id }, { user2: user._id }]
        });
        const matchedUserIds = existingMatches.map(m =>
            m.user1.toString() === user._id.toString() ? m.user2.toString() : m.user1.toString()
        );

        console.log(`\nExisting Matches: ${existingMatches.length}`);
        matchedUserIds.forEach(id => console.log(`  - Excluded ID: ${id}`));

        const isCharlieExcluded = matchedUserIds.includes(charlie._id.toString());
        console.log(`Is Charlie Excluded? ${isCharlieExcluded ? 'YES ❌' : 'NO ✅'}`);

        if (isCharlieExcluded) {
            console.log('--- FIXING EXCLUSION ---');
            await Match.deleteMany({ $or: [{ user1: user._id }, { user2: user._id }] });
            console.log('Deleted existing matches for User.');
        }

        // 4. Run Mutual Match Logic
        console.log('\n--- MATCH SIMULATION ---');
        console.log('User Wants:', user.skillsWanted.map(s => `"${s.skillName}" [${s.category}]`).join(', '));
        console.log('Charlie Offers:', charlie.skillsOffered.map(s => `"${s.skillName}" [${s.category}]`).join(', '));

        const commonSkills = findMutualMatches(user, charlie); // Uses the updated matchmaker util
        console.log(`Mutual Skills Found: ${commonSkills.length}`);

        if (commonSkills.length > 0) {
            const { totalScore } = calculateMatchScore(user, charlie, commonSkills);
            console.log(`Match Score: ${totalScore}`);
            console.log(`Min Score required: 10`);

            if (totalScore >= 10) {
                console.log('✅ SUCCESS: Match Should Appear via findMatches()');
            } else {
                console.log(`❌ FAIL: Score too low (${totalScore} < 10)`);
            }
        } else {
            console.log('❌ FAIL: No Mutual Skills Found via findMutualMatches()');
            // Debug failure (using new trim logic)
            user.skillsOffered.forEach(offered => {
                charlie.skillsWanted.forEach(wanted => {
                    const offeredName = offered.skillName.toLowerCase().trim();
                    const wantedName = wanted.skillName.toLowerCase().trim();
                    const match = (offeredName.includes(wantedName) || wantedName.includes(offeredName)) &&
                        offered.category.trim() === wanted.category.trim();

                    if (match) {
                        // Check reciprocal leg
                        const reciprocal = charlie.skillsOffered.find(offered2 =>
                            user.skillsWanted.some(wanted1 => {
                                const offered2Name = offered2.skillName.toLowerCase().trim();
                                const wanted1Name = wanted1.skillName.toLowerCase().trim();
                                return (offered2Name.includes(wanted1Name) || wanted1Name.includes(offered2Name)) &&
                                    offered2.category.trim() === wanted1.category.trim();
                            })
                        );
                        console.log(`  Leg 1 (User->Charlie): MATCH (${offered.skillName} -> ${wanted.skillName})`);
                        console.log(`  Leg 2 (Charlie->User): ${reciprocal ? 'MATCH' : 'NO MATCH'}`);
                    }
                });
            });
        }

        // 5. Clean Requests involving Charlie just in case
        await Request.deleteMany({
            $or: [
                { sender: user._id, receiver: charlie._id },
                { sender: charlie._id, receiver: user._id }
            ]
        });
        console.log('Cleaned up any pending requests between User and Charlie.');

        console.log('\n--- DIAGNOSTICS END ---');
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTargetedDiagnostics();

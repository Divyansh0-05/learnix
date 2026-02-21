const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Require models
const User = require('../models/User');
const Skill = require('../models/Skill');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const checkSkills = async () => {
    try {
        console.log('Checking Skills...');

        // Find Charlie
        const charlie = await User.findOne({ email: 'charlie@marketing.com' })
            .populate('skillsOffered')
            .populate('skillsWanted');

        if (!charlie) {
            console.log('Charlie not found!');
            process.exit();
        }

        // Find YOU (the logged in user). I'll find 'Photography' WANTED skill
        const userWithPhotography = await Skill.findOne({
            skillName: { $regex: /photography/i },
            type: 'WANTED'
        }).populate('user');

        if (!userWithPhotography) {
            console.log('NO USER WANTS PHOTOGRAPHY??');
            // Maybe exact match?
            const userExact = await Skill.findOne({ skillName: 'Photography', type: 'WANTED' });
            if (userExact) console.log('Found exact match but regex failed?');
        } else {
            const user = await User.findById(userWithPhotography.user._id)
                .populate('skillsOffered')
                .populate('skillsWanted');

            console.log(`\nUser: ${user.name} (${user.email})`);
            console.log('  Wants:');
            user.skillsWanted.forEach(s => {
                console.log(`    - "${s.skillName}" (Category: "${s.category}")`);
            });
            console.log('  Offers:');
            user.skillsOffered.forEach(s => {
                console.log(`    - "${s.skillName}" (Category: "${s.category}")`);
            });

            console.log(`\nCharlie: ${charlie.name} (${charlie.email})`);
            console.log('  Offers:');
            charlie.skillsOffered.forEach(s => {
                console.log(`    - "${s.skillName}" (Category: "${s.category}")`);
            });
            console.log('  Wants:');
            charlie.skillsWanted.forEach(s => {
                console.log(`    - "${s.skillName}" (Category: "${s.category}")`);
            });

            // Specific check
            const userWanted = user.skillsWanted.find(s => s.skillName.toLowerCase().includes('photography'));
            const charlieOffered = charlie.skillsOffered.find(s => s.skillName.toLowerCase().includes('photography'));

            if (userWanted && charlieOffered) {
                console.log('\n--- COMPARISON ---');
                console.log(`User Wanted: "${userWanted.skillName}" [${userWanted.category}]`);
                console.log(`Charlie Offered: "${charlieOffered.skillName}" [${charlieOffered.category}]`);
                console.log(`Category Match: ${userWanted.category === charlieOffered.category}`);
                console.log(`Name Partial Match: ${charlieOffered.skillName.toLowerCase().includes(userWanted.skillName.toLowerCase())}`);
            }
        }

        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkSkills();

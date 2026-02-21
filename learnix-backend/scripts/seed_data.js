const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

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


const checkAndSeed = async () => {
    try {
        console.log('Seeding Data...');

        // 1. Check for existing seed users
        const seedEmails = ['alice@test.com', 'bob@test.com'];

        // Remove existing skills for these users first if they exist
        const existingUsers = await User.find({ email: { $in: seedEmails } });
        for (const u of existingUsers) {
            await Skill.deleteMany({ user: u._id });
            await User.deleteOne({ _id: u._id });
            console.log(`Cleaned up old user: ${u.name}`);
        }

        // 2. Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Alice
        const aliceReal = await User.create({
            name: 'Alice Developer',
            email: 'alice@test.com',
            password: hashedPassword,
            bio: 'I love Python and backend development.',
            role: 'user',
            isEmailVerified: true
        });
        console.log('Created User: Alice');

        // Bob
        const bobReal = await User.create({
            name: 'Bob Frontend',
            email: 'bob@test.com',
            password: hashedPassword,
            bio: 'React enthusiast looking to learn backend.',
            role: 'user',
            isEmailVerified: true
        });
        console.log('Created User: Bob');


        // 3. Create Skills
        // Alice: Offers Python, Wants React
        const aliceSkill1 = await Skill.create({
            user: aliceReal._id,
            skillName: 'Python',
            category: 'Programming',
            level: 'expert',
            type: 'OFFERED',
            description: 'Can teach you Python from scratch.'
        });

        const aliceSkill2 = await Skill.create({
            user: aliceReal._id,
            skillName: 'React',
            category: 'Programming',
            level: 'beginner',
            type: 'WANTED',
            description: 'Need help with hooks and context.'
        });

        // Update Alice's user doc
        aliceReal.skillsOffered.push(aliceSkill1._id);
        aliceReal.skillsWanted.push(aliceSkill2._id);
        await aliceReal.save({ validateBeforeSave: false });


        // Bob: Offers React, Wants Python
        const bobSkill1 = await Skill.create({
            user: bobReal._id,
            skillName: 'React',
            category: 'Programming',
            level: 'expert',
            type: 'OFFERED',
            description: 'I build complex huge apps with React.'
        });

        const bobSkill2 = await Skill.create({
            user: bobReal._id,
            skillName: 'Python',
            category: 'Programming',
            level: 'beginner',
            type: 'WANTED',
            description: 'Want to learn data science basics.'
        });

        // Update Bob
        bobReal.skillsOffered.push(bobSkill1._id);
        bobReal.skillsWanted.push(bobSkill2._id);
        await bobReal.save({ validateBeforeSave: false });

        console.log('Skills created and linked.');
        console.log('Done!');
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAndSeed();

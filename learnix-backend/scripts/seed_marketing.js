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

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedUniversalMatch = async () => {
    try {
        console.log('Seeding Universal Match...');

        const email = 'charlie@marketing.com';

        // Cleanup existing
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            await Skill.deleteMany({ user: existingUser._id });
            await User.deleteOne({ _id: existingUser._id });
            console.log(`Cleaned up old user: Charlie`);
        }

        // Create Charlie
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const charlie = await User.create({
            name: 'Charlie Universal',
            email: email,
            password: hashedPassword,
            bio: 'I do Marketing AND Photography. Looking for React and Photo help!',
            role: 'user',
            isEmailVerified: true,
            location: {
                city: 'New York',
                country: 'USA'
            }
        });

        // 1. Charlie OFFERS:
        // - Marketing (Matches Tester 2 Want)
        // - Photography (Matches Tester 1 Want)
        const offer1 = await Skill.create({
            user: charlie._id,
            skillName: 'Social Media Marketing',
            category: 'Marketing',
            level: 'expert',
            type: 'OFFERED',
            description: 'Can help you grow your brand.'
        });

        const offer2 = await Skill.create({
            user: charlie._id,
            skillName: 'Portrait Photography',
            category: 'Photography',
            level: 'expert',
            type: 'OFFERED',
            description: 'Professional portraits.'
        });

        // 2. Charlie WANTS:
        // - React (Matches Tester 1 & 2 Offer)
        // - Photography (Matches Tester 2 Offer "Photography")
        const want1 = await Skill.create({
            user: charlie._id,
            skillName: 'React',
            category: 'Programming',
            level: 'intermediate',
            type: 'WANTED',
            description: 'Need a website.'
        });

        const want2 = await Skill.create({
            user: charlie._id,
            skillName: 'Event Photography',
            category: 'Photography', // Matches Tester 2's Offer Category
            level: 'intermediate',
            type: 'WANTED',
            description: 'Need photos for my event.'
        });

        // Update Charlie
        charlie.skillsOffered.push(offer1._id, offer2._id);
        charlie.skillsWanted.push(want1._id, want2._id);
        await charlie.save({ validateBeforeSave: false });

        console.log('Charlie updated to be a SUPER match!');
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUniversalMatch();

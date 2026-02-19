const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const makeAdmin = async () => {
    try {
        const email = process.argv[2];

        if (!email) {
            console.error('Please provide a user email: node scripts/makeAdmin.js user@example.com');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Success! ${email} is now an admin.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

makeAdmin();

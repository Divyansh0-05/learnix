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

const listAllUsers = async () => {
    try {
        console.log('--- LISTING ALL USERS ---');

        const users = await User.find({})
            .populate('skillsOffered')
            .populate('skillsWanted');

        users.forEach(u => {
            console.log(`\nID: ${u._id}`);
            console.log(`Name: ${u.name} (${u.email})`);
            console.log('  Offers:');
            u.skillsOffered.forEach(s => console.log(`    - ${s.skillName} [${s.category}]`));
            console.log('  Wants:');
            u.skillsWanted.forEach(s => console.log(`    - ${s.skillName} [${s.category}]`));
        });

        console.log('\n--- END ---');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listAllUsers();

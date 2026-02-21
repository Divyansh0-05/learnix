const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/User');
const Skill = require('../models/Skill');

// Load env vars
dotenv.config({ path: '../.env' });

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const skillsList = [
    { name: 'JavaScript', category: 'Programming' },
    { name: 'Python', category: 'Programming' },
    { name: 'React', category: 'Programming' },
    { name: 'Graphic Design', category: 'Design' },
    { name: 'UI/UX', category: 'Design' },
    { name: 'Guitar', category: 'Music' },
    { name: 'Piano', category: 'Music' },
    { name: 'Spanish', category: 'Language' },
    { name: 'French', category: 'Language' },
    { name: 'Italian', category: 'Cooking' },
    { name: 'Yoga', category: 'Fitness' }
];

const seedSkills = async () => {
    try {
        // Get all users
        const users = await User.find();

        if (users.length === 0) {
            console.log('No users found. Run seed_users.js first.'.red);
            process.exit(1);
        }

        // Clear existing skills
        await Skill.deleteMany();
        console.log('Skills cleared.'.red.inverse);

        // Assign skills to each user
        for (const user of users) {
            // Pick 1-3 offered skills
            const offeredCount = Math.floor(Math.random() * 3) + 1;
            const offeredSkills = [];

            for (let i = 0; i < offeredCount; i++) {
                const randomSkill = skillsList[Math.floor(Math.random() * skillsList.length)];

                // Avoid duplicates for same user
                const exists = await Skill.findOne({ user: user._id, skillName: randomSkill.name, type: 'OFFERED' });
                if (exists) continue;

                const skill = await Skill.create({
                    user: user._id,
                    skillName: randomSkill.name,
                    category: randomSkill.category,
                    level: ['beginner', 'intermediate', 'expert'][Math.floor(Math.random() * 3)],
                    type: 'OFFERED',
                    description: `I can teach you ${randomSkill.name}. I have experience working with it.`
                });
                offeredSkills.push(skill._id);
                console.log(`Added OFFERED skill: ${randomSkill.name} for user ${user.name}`.green);
            }

            // Pick 1-3 wanted skills
            const wantedCount = Math.floor(Math.random() * 3) + 1;
            const wantedSkills = [];

            for (let i = 0; i < wantedCount; i++) {
                const randomSkill = skillsList[Math.floor(Math.random() * skillsList.length)];

                // Avoid duplicates (and can't want what you offer ideally, but simple for now)
                const exists = await Skill.findOne({ user: user._id, skillName: randomSkill.name });
                if (exists) continue;

                const skill = await Skill.create({
                    user: user._id,
                    skillName: randomSkill.name,
                    category: randomSkill.category,
                    level: ['beginner', 'intermediate', 'expert'][Math.floor(Math.random() * 3)],
                    type: 'WANTED',
                    description: `I want to learn ${randomSkill.name}.`
                });
                wantedSkills.push(skill._id);
                console.log(`Added WANTED skill: ${randomSkill.name} for user ${user.name}`.blue);
            }

            // Update user skills array
            await User.findByIdAndUpdate(user._id, {
                skillsOffered: offeredSkills,
                skillsWanted: wantedSkills
            });
        }

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red);
        process.exit(1);
    }
};

seedSkills();

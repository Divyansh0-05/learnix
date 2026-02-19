const User = require('../models/User');
const Skill = require('../models/Skill');
const Match = require('../models/Match');

// Helper to convert level to numeric value
const getLevelValue = (level) => {
    const levels = { 'beginner': 1, 'intermediate': 2, 'expert': 3 };
    return levels[level] || 1;
};

// Calculate compatibility score between two users
exports.calculateMatchScore = (user1, user2, commonSkills) => {
    let score = 0;
    const factors = [];

    // 1. Skill Match Quality (0-40 points)
    const skillScore = Math.min(commonSkills.length * 10, 40);
    score += skillScore;
    factors.push({ factor: 'Skill Matches', score: skillScore, max: 40 });

    // 2. Skill Level Compatibility (0-20 points)
    let levelScore = 0;
    commonSkills.forEach(match => {
        const offeredLevel = getLevelValue(match.user1Offers?.level || match.user2Offers?.level);
        const wantedLevel = getLevelValue(match.user2Wants?.level || match.user1Wants?.level);

        if (offeredLevel >= wantedLevel) {
            levelScore += 5;
        } else if (offeredLevel === wantedLevel - 1) {
            levelScore += 3;
        }
    });
    levelScore = Math.min(levelScore, 20);
    score += levelScore;
    factors.push({ factor: 'Level Compatibility', score: levelScore, max: 20 });

    // 3. Location Proximity (0-15 points)
    let locationScore = 5; // Default for no location
    if (user1?.location && user2?.location) {
        if (user1.location.city === user2.location.city &&
            user1.location.country === user2.location.country) {
            locationScore = 15;
        } else if (user1.location.country === user2.location.country) {
            locationScore = 10;
        } else {
            locationScore = 5;
        }
    }
    score += locationScore;
    factors.push({ factor: 'Location', score: locationScore, max: 15 });

    // 4. Mode Preference Compatibility (0-10 points)
    let modeScore = 0;
    const pref1 = user1?.modePreference || 'both';
    const pref2 = user2?.modePreference || 'both';

    if (pref1 === 'both' || pref2 === 'both' || pref1 === pref2) {
        modeScore = 10;
    } else {
        modeScore = 3;
    }
    score += modeScore;
    factors.push({ factor: 'Mode Preference', score: modeScore, max: 10 });

    // 5. Trust Score (0-10 points)
    const trust1 = user1?.trustScore || 0;
    const trust2 = user2?.trustScore || 0;
    const avgTrust = (trust1 + trust2) / 2;
    const trustScore = Math.round(avgTrust / 10);
    score += trustScore;
    factors.push({ factor: 'Trust Score', score: trustScore, max: 10 });

    // 6. Rating Bonus (0-5 points)
    const rating1 = user1?.averageRating || 0;
    const rating2 = user2?.averageRating || 0;
    const avgRating = (rating1 + rating2) / 2;
    const ratingScore = Math.round(avgRating);
    score += ratingScore;
    factors.push({ factor: 'Average Rating', score: ratingScore, max: 5 });

    return {
        totalScore: Math.min(score, 100),
        factors
    };
};

// Find mutual skill matches
exports.findMutualMatches = (user1, user2) => {
    const commonSkills = [];

    // Skip if either user has no skills
    if (!user1.skillsOffered?.length || !user2.skillsWanted?.length ||
        !user2.skillsOffered?.length || !user1.skillsWanted?.length) {
        return commonSkills;
    }

    // Find skills where user1 offers what user2 wants
    user1.skillsOffered.forEach(offered => {
        user2.skillsWanted.forEach(wanted => {
            if (offered.skillName.toLowerCase() === wanted.skillName.toLowerCase() &&
                offered.category === wanted.category) {

                // Find corresponding skill where user2 offers what user1 wants
                const reciprocalMatch = user2.skillsOffered.find(offered2 =>
                    user1.skillsWanted.some(wanted1 =>
                        offered2.skillName.toLowerCase() === wanted1.skillName.toLowerCase() &&
                        offered2.category === wanted1.category
                    )
                );

                if (reciprocalMatch) {
                    commonSkills.push({
                        user1Offers: offered,
                        user2Wants: wanted,
                        user2Offers: reciprocalMatch,
                        user1Wants: user1.skillsWanted.find(w =>
                            w.skillName.toLowerCase() === reciprocalMatch.skillName.toLowerCase()
                        )
                    });
                }
            }
        });
    });

    return commonSkills;
};

// Update match scores periodically
exports.updateMatchScores = async () => {
    try {
        const matches = await Match.find({ status: { $ne: 'blocked' } })
            .populate('user1')
            .populate('user2')
            .populate('commonSkills.user1Offers')
            .populate('commonSkills.user2Wants')
            .populate('commonSkills.user2Offers')
            .populate('commonSkills.user1Wants');

        for (const match of matches) {
            const { totalScore } = exports.calculateMatchScore(
                match.user1,
                match.user2,
                match.commonSkills
            );

            match.matchScore = totalScore;
            match.lastInteractionAt = new Date();
            await match.save();
        }

        console.log(`Updated scores for ${matches.length} matches`);
    } catch (error) {
        console.error('Error updating match scores:', error);
    }
};

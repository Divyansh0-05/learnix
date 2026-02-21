import React, { useMemo } from 'react';
import './StarryBackground.css';

const generateStars = (count) => {
    let shadow = [];
    for (let i = 0; i < count; i++) {
        // We use 2000px vertically to match the animation loop height
        const x = Math.floor(Math.random() * 2500);
        const y = Math.floor(Math.random() * 2000);
        // Add subtle opacity variation for a glowing effect
        const alpha = (Math.random() * 0.5 + 0.5).toFixed(2);
        shadow.push(`${x}px ${y}px rgba(255, 255, 255, ${alpha})`);
    }
    return shadow.join(', ');
};

export default function StarryBackground() {
    // Generate different layers once on mount
    const starsSmall = useMemo(() => generateStars(800), []);
    const starsMedium = useMemo(() => generateStars(300), []);
    const starsLarge = useMemo(() => generateStars(100), []);

    return (
        <div className="starfield-container">
            <div className="stars-small" style={{ boxShadow: starsSmall }}></div>
            <div className="stars-medium" style={{ boxShadow: starsMedium }}></div>
            <div className="stars-large" style={{ boxShadow: starsLarge }}></div>
        </div>
    );
}

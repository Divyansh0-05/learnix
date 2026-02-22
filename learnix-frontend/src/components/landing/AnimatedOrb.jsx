import React from 'react';
import './AnimatedOrb.css';
import { FiCode, FiMusic, FiBookOpen, FiCoffee, FiVideo, FiActivity, FiGlobe, FiAperture, FiTool, FiEdit3 } from 'react-icons/fi';

export default function AnimatedOrb() {
    return (
        <div className="orb-container">
            {/* Outer Orbit */}
            <div className="orbit-ring">
                <div className="skill-icon item-1"><FiActivity /></div> {/* Dance / Fitness */}
                <div className="skill-icon item-2"><FiAperture /></div> {/* Photography */}
                <div className="skill-icon item-3"><FiMusic /></div> {/* Music */}
                <div className="skill-icon item-4"><FiTool /></div> {/* Crafting / Handyman */}
                <div className="skill-icon item-5"><FiCoffee /></div> {/* Cooking / Barista */}
                <div className="skill-icon item-6"><FiCode /></div> {/* Technology */}
            </div>

            {/* Inner Orbit (Reversed) */}
            <div className="orbit-ring-inner">
                <div className="skill-icon-inner inner-1"><FiEdit3 /></div> {/* Writing / Art */}
                <div className="skill-icon-inner inner-2"><FiVideo /></div> {/* Acting / Film */}
                <div className="skill-icon-inner inner-3"><FiGlobe /></div> {/* Languages */}
                <div className="skill-icon-inner inner-4"><FiBookOpen /></div> {/* Academics */}
            </div>

            {/* Glowing Center Orb */}
            <div className="glowing-orb"></div>
        </div>
    );
}

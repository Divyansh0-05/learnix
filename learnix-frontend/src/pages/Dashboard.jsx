import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { FiTarget, FiZap, FiMessageSquare, FiUser } from 'react-icons/fi';

export default function Dashboard() {
    const { user } = useAuth();

    const navCards = [
        { label: 'My Skills', to: '/skills', icon: <FiTarget />, desc: 'Manage skills you offer & want to learn' },
        { label: 'Matches', to: '/matches', icon: <FiZap />, desc: 'See your skill-swap matches' },
        { label: 'Chat', to: '/chat', icon: <FiMessageSquare />, desc: 'Connect with your partners' },
        { label: 'Profile', to: '/profile', icon: <FiUser />, desc: 'Update your profile & preferences' },
    ];

    return (
        <>
            <Helmet><title>Dashboard — Learnix</title></Helmet>
            <div style={{ minHeight: '100vh', background: '#000000', padding: '7rem 2rem 4rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                    <p style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Dashboard
                    </p>
                    <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
                        Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '3rem' }}>
                        What would you like to do today?
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                        {navCards.map(card => (
                            <Link
                                key={card.to}
                                to={card.to}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '1.25rem',
                                    padding: '1.75rem',
                                    textDecoration: 'none',
                                    transition: 'all 0.25s',
                                    display: 'block',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#ffffff';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{card.icon}</div>
                                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{card.label}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.5 }}>{card.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

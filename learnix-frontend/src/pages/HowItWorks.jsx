import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUserPlus, FiCpu, FiCalendar, FiTrendingUp, FiCrosshair, FiArrowLeft } from 'react-icons/fi';

const steps = [
    {
        number: '01',
        icon: <FiUserPlus />,
        title: 'Create your profile',
        desc: 'Sign up in seconds. List the skills you can confidently teach and the exact skills you want to learn. Your profile is your networking engine.',
    },
    {
        number: '02',
        icon: <FiCpu />,
        title: 'Get instantly matched',
        desc: 'Our proprietary matching algorithm works in the background to find someone whose "teach" perfectly aligns with your "learn" — and vice versa.',
    },
    {
        number: '03',
        icon: <FiCalendar />,
        title: 'Connect & schedule',
        desc: 'Use the built-in chat to coordinate with your match. Agree on a format, decide where to collaborate, and pick a time.',
    },
    {
        number: '04',
        icon: <FiTrendingUp />,
        title: 'Exchange & grow',
        desc: 'Run your sessions, swap knowledge, and build real connections. Rate the experience afterward to help maintain community trust.',
    },
];

export default function HowItWorks() {
    return (
        <>
            <Helmet>
                <title>How It Works — Learnix</title>
                <meta name="description" content="Learn how to get started with Learnix in four simple steps." />
            </Helmet>

            <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000', paddingTop: '64px', overflowX: 'hidden' }}>

                {/* Background Glow */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '-20%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* Header */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '8rem 2rem 4rem',
                    textAlign: 'center',
                }}>
                    <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                        <Link to="/" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'rgba(255,255,255,0.4)',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            transition: 'color 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                        >
                            <FiArrowLeft /> Back to Home
                        </Link>
                    </div>

                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '0.4rem 1rem',
                        borderRadius: '2rem',
                        marginBottom: '2rem'
                    }}>
                        <FiCrosshair style={{ color: '#fff', opacity: 0.7 }} />
                        <span style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>Getting Started</span>
                    </div>

                    <h1 style={{
                        color: '#fff',
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.2) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Four steps.<br />Infinite skills.
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        maxWidth: '500px',
                        margin: '0 auto',
                        fontWeight: 400
                    }}>
                        Getting started on Learnix takes less than two minutes. See how the platform works from signing up to your first swap.
                    </p>
                </div>

                {/* Timeline Steps Layout */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '0 2rem 6rem',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                    }}>
                        {steps.map(({ number, icon, title, desc }, i) => (
                            <div
                                key={number}
                                style={{
                                    display: 'flex',
                                    gap: '2rem',
                                    background: 'rgba(255,255,255,0.015)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '1.5rem',
                                    padding: '2.5rem',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Left side content (Number & Icon) */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <span style={{
                                        color: 'rgba(255,255,255,0.15)',
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.05em'
                                    }}>
                                        {number}
                                    </span>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#e4e4e7',
                                        fontSize: '1.25rem',
                                        boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
                                    }}>
                                        {icon}
                                    </div>
                                    {/* Connecting Line (except last item) */}
                                    {i < steps.length - 1 && (
                                        <div style={{
                                            width: '2px',
                                            flexGrow: 1,
                                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0))',
                                            minHeight: '2rem'
                                        }} />
                                    )}
                                </div>

                                {/* Right side content (Text) */}
                                <div style={{ paddingTop: '0.2rem' }}>
                                    <h3 style={{
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '1.25rem',
                                        letterSpacing: '-0.02em',
                                        marginBottom: '0.75rem',
                                    }}>
                                        {title}
                                    </h3>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.45)',
                                        fontSize: '1rem',
                                        lineHeight: 1.7,
                                    }}>
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{
                    textAlign: 'center',
                    padding: '2rem 2rem 8rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <Link
                        to="/register"
                        style={{
                            display: 'inline-block',
                            background: '#ffffff',
                            color: '#000000',
                            textDecoration: 'none',
                            padding: '1rem 3rem',
                            borderRadius: '3rem',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            transition: 'all 0.25s ease',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#e5e5e5';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Start your first swap
                    </Link>
                </div>
            </div>
        </>
    );
}

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import AnimatedOrb from '../components/landing/AnimatedOrb';

export default function Home() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) return null;

    return (
        <>
            <Helmet>
                <title>Learnix</title>
                <meta name="description" content="Barter skills. Grow together." />
            </Helmet>

            {/* ── Full-viewport wrapper ── */}
            <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000000' }}>

                {/* ── CSS Animated Orb ── */}
                <div style={{
                    position: 'absolute',
                    top: '70%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) scale(0.93)',
                    zIndex: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <AnimatedOrb />
                </div>

                {/* ── Dark overlay ── */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 80%, rgba(0,0,0,1) 100%)',
                    pointerEvents: 'none',
                }} />

                {/* ── Top content ── */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50vh',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    textAlign: 'center',
                    padding: '4rem 1.5rem 0',
                }}>
                    {/* Wordmark */}
                    <h1 style={{
                        fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.05em',
                        color: '#ffffff',
                        lineHeight: 1,
                        margin: 0,
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        Learnix
                    </h1>

                    {/* One-liner */}
                    <p style={{
                        color: 'rgba(255,255,255,0.55)',
                        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                        fontWeight: 400,
                        letterSpacing: '0.01em',
                        margin: 0,
                    }}>
                        Barter skills. Grow together.
                    </p>

                    {/* CTA */}
                    <Link
                        to="/register"
                        style={{
                            marginTop: '0.5rem',
                            display: 'inline-block',
                            background: '#ffffff',
                            color: '#06060c',
                            textDecoration: 'none',
                            padding: '0.85rem 2.25rem',
                            borderRadius: '2rem',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            transition: 'all 0.25s ease',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#e5e5e5';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
                        }}
                    >
                        Get Started
                    </Link>
                </div>

            </div>
        </>
    );
}

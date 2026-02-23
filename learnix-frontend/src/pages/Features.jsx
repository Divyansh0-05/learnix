import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCpu, FiMessageCircle, FiUserCheck, FiRefreshCw, FiGlobe, FiShield, FiZap, FiArrowLeft } from 'react-icons/fi';

const features = [
    {
        icon: <FiCpu />,
        title: 'Smart Matching',
        desc: 'Our algorithm pairs you with the most compatible skill-swap partner from a growing community based on mutual interests and location.',
        color: '#e4e4e7'
    },
    {
        icon: <FiMessageCircle />,
        title: 'Built-in Chat',
        desc: 'Coordinate, schedule, and connect with your match — all without leaving Learnix. Instant messaging helps you learn faster.',
        color: '#e4e4e7'
    },
    {
        icon: <FiUserCheck />,
        title: 'Skill Profiles',
        desc: 'Showcase what you teach and what you want to learn. Your profile acts as your organic resume and does the networking for you.',
        color: '#e4e4e7'
    },
    {
        icon: <FiRefreshCw />,
        title: 'Two-way Exchange',
        desc: 'Every match is mutually beneficial. You give knowledge, you get knowledge. A perfectly balanced ecosystem of eager learners.',
        color: '#e4e4e7'
    },
    {
        icon: <FiGlobe />,
        title: 'Any skill, anywhere',
        desc: 'From full-stack coding to calligraphy, classical guitar to video editing. If it is a skill, it absolutely belongs on Learnix.',
        color: '#e4e4e7'
    },
    {
        icon: <FiShield />,
        title: 'Safe & Trusted',
        desc: 'Verified profiles and community ratings keep the platform trustworthy for everyone. Learn with complete peace of mind.',
        color: '#e4e4e7'
    },
];

export default function Features() {
    return (
        <>
            <Helmet>
                <title>Features — Learnix</title>
                <meta name="description" content="Everything Learnix offers to help you barter skills and grow." />
            </Helmet>

            <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000', paddingTop: '64px', overflowX: 'hidden' }}>

                {/* Background Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(200, 220, 255, 0.04) 0%, rgba(0,0,0,0) 60%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* Header Section */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: 'clamp(4rem, 15vh, 8rem) clamp(1rem, 5vw, 2rem) clamp(2rem, 10vh, 5rem)',
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
                        <FiZap style={{ color: '#fff', opacity: 0.7 }} />
                        <span style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>Platform Features</span>
                    </div>

                    <h1 style={{
                        color: '#fff',
                        fontSize: 'clamp(1.8rem, 8vw, 4rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, #ffffff 0%, #888888 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Everything you need<br />to swap smarter.
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 'clamp(0.9rem, 4vw, 1.1rem)',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                        margin: '0 auto',
                        fontWeight: 400
                    }}>
                        Learnix is built end-to-end for skill exchange. From smart algorithmic
                        matchmaking to integrated real-time chat, we provide the tools so you can focus on learning.
                    </p>
                </div>

                {/* Main Feature Grid */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 clamp(1rem, 5vw, 2rem) clamp(2rem, 5vh, 4rem)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 80vw, 320px), 1fr))',
                    gap: '1.5rem',
                }}>
                    {features.map(({ icon, title, desc, color }) => (
                        <div
                            key={title}
                            style={{
                                background: 'rgba(255,255,255,0.015)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '1.5rem',
                                padding: '2.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.boxShadow = `0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px -5px ${color}20`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Subtle colored glow in corner */}
                            <div style={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 150,
                                height: 150,
                                background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                                borderRadius: '50%',
                                pointerEvents: 'none'
                            }} />

                            <div style={{
                                fontSize: '1.75rem',
                                color: color,
                                marginBottom: '1.5rem',
                                background: `${color}10`,
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '16px',
                                border: `1px solid ${color}20`
                            }}>
                                {icon}
                            </div>
                            <h3 style={{
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '1.2rem',
                                marginBottom: '0.75rem',
                                letterSpacing: '-0.02em'
                            }}>
                                {title}
                            </h3>
                            <p style={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.95rem',
                                lineHeight: 1.6
                            }}>
                                {desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA section */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    background: 'radial-gradient(ellipse at top center, rgba(255,255,255,0.03) 0%, transparent 70%)',
                    padding: 'clamp(3rem, 8vh, 6rem) 2rem',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
                        Ready to start swapping?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                        Join thousands of learners exchanging skills for free right now.
                    </p>
                    <a href="/register" style={{
                        display: 'inline-block',
                        background: '#ffffff',
                        color: '#000000',
                        padding: '1rem 2.5rem',
                        borderRadius: '2rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.background = '#e5e5e5';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = '#ffffff';
                        }}
                    >
                        Create Free Account
                    </a>
                </div>

            </div>
        </>
    );
}

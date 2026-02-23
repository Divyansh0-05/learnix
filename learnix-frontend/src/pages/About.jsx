import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUsers, FiGlobe, FiTarget, FiHeart, FiLock, FiArrowLeft } from 'react-icons/fi';

export default function About() {
    return (
        <>
            <Helmet>
                <title>About — Learnix</title>
                <meta name="description" content="Learn about Learnix — the skill barter platform." />
            </Helmet>

            <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000', paddingTop: '64px', overflowX: 'hidden' }}>
                <style>
                    {`
                        .values-grid {
                            display: grid;
                            gap: 1.5rem;
                            grid-template-columns: repeat(4, 1fr);
                        }
                        @media (max-width: 1100px) {
                            .values-grid {
                                grid-template-columns: repeat(2, 1fr);
                            }
                        }
                        @media (max-width: 640px) {
                            .values-grid {
                                grid-template-columns: repeat(1, 1fr);
                            }
                        }
                    `}
                </style>

                {/* Background Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* Hero Section */}
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
                        <FiGlobe style={{ color: '#fff', opacity: 0.7 }} />
                        <span style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>Our Mission</span>
                    </div>

                    <h1 style={{
                        color: '#fff',
                        fontSize: 'clamp(1.8rem, 8vw, 4rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to bottom right, #ffffff, #a0a0a0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Skills are the <br />new currency.
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 'clamp(0.95rem, 3.5vw, 1.1rem)',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                        margin: '0 auto',
                        fontWeight: 400
                    }}>
                        Learnix was built on one fundamental belief — everyone has something worth teaching,
                        and something worth learning. We connect people through direct skill exchange,
                        removing money from the equation entirely.
                    </p>
                </div>

                {/* Stats / Proof Section */}
                <div style={{
                    maxWidth: '1000px',
                    margin: '0 auto',
                    padding: '0 clamp(1rem, 5vw, 2rem) clamp(4rem, 10vh, 6rem)',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '2rem',
                        padding: 'clamp(2rem, 6vw, 3.5rem) clamp(1rem, 4vw, 2rem)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(160px, 40vw, 200px), 1fr))',
                        gap: 'clamp(1.5rem, 5vw, 2.5rem)',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div>
                            <div style={{ fontSize: 'clamp(2rem, 8vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>100%</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free forever</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'clamp(2rem, 8vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Zero</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hidden fees</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'clamp(2rem, 8vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Infinite</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learning potential</div>
                        </div>
                    </div>
                </div>

                {/* Values Grid */}
                <div style={{ background: '#030305', padding: 'clamp(4rem, 10vh, 6rem) 0', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 clamp(1rem, 5vw, 2rem)',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 8vh, 4rem)' }}>
                            <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 6vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                                Built on core values
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.9rem, 3.5vw, 1rem)' }}>
                                We designed Learnix to foster genuine human connections.
                            </p>
                        </div>

                        <div className="values-grid">
                            {[
                                { icon: <FiUsers />, label: 'Community First', body: 'Every decision we make puts our learners and teachers before anything else. Your safety and growth are our priority.' },
                                { icon: <FiLock />, label: 'No Barriers', body: 'No cost, no gatekeeping. If you have a skill to share, you belong here. Education should be accessible to all.' },
                                { icon: <FiTarget />, label: 'Real Connections', body: 'Our matching algorithm pairs people who genuinely complement each other — creating lasting mentorships, not just random pairings.' },
                                { icon: <FiHeart />, label: 'Mutual Growth', body: 'The best way to learn is to teach. By sharing what you know, you reinforce your own mastery while helping others.' },
                            ].map(({ icon, label, body }) => (
                                <div key={label} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '1.5rem',
                                    padding: 'clamp(1.5rem, 5vw, 2.5rem) clamp(1.25rem, 4vw, 2rem)',
                                    transition: 'all 0.3s ease',
                                    // Hover effect handled below via onMouse events
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontSize: '1.25rem',
                                        marginBottom: '1.5rem',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {icon}
                                    </div>
                                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                                        {label}
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

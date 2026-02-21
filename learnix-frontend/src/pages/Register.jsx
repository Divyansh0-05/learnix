import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMail, FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import StarryBackground from '../components/common/StarryBackground';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [modePreference, setModePreference] = useState('both');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register, isAuthenticated, loading: authLoading } = useAuth();

    React.useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, authLoading, navigate]);

    if (authLoading) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !city || !country) {
            setError('Please fill in all required fields');
            return;
        }

        setError('');
        setLoading(true);
        const location = { city, country };
        const result = await register({ name, email, password, location, modePreference });
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Registration failed. Please try again.');
        }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '0.5rem',
        padding: '0.6rem 0.8rem',
        color: '#fff',
        fontSize: '0.85rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    };

    return (
        <>
            <Helmet>
                <title>Sign Up — Learnix</title>
            </Helmet>
            <StarryBackground />
            <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '100vh',
                minHeight: '100dvh', // Dynamic viewport height
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 1rem', // Balanced padding for centering between bars
                boxSizing: 'border-box'
            }}>
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                    <Link
                        to="/"
                        style={{
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
                    width: '100%',
                    maxWidth: '400px',
                    background: '#0a0a0f',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1.25rem',
                    padding: '1.75rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0,0,0,0.5)',
                }}>
                    <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
                        Create an account
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                        Join Learnix and start bartering skills
                    </p>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            color: '#fca5a5',
                            fontSize: '0.8rem',
                            marginBottom: '1rem',
                        }}>{error}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                                FULL NAME
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={inputStyle}
                                placeholder="Full Name"
                                onFocus={e => (e.target.style.borderColor = '#ffffff')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
                            />
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                                EMAIL
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={inputStyle}
                                placeholder="Email Address"
                                onFocus={e => (e.target.style.borderColor = '#ffffff')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                                    CITY
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    style={inputStyle}
                                    placeholder="City"
                                    onFocus={e => (e.target.style.borderColor = '#ffffff')}
                                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                                    COUNTRY
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={country}
                                    onChange={e => setCountry(e.target.value)}
                                    style={inputStyle}
                                    placeholder="Country"
                                    onFocus={e => (e.target.style.borderColor = '#ffffff')}
                                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                                PREFERRED MODE
                            </label>
                            <select
                                value={modePreference}
                                onChange={e => setModePreference(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="both">Both (Online & In-person)</option>
                                <option value="online">Online Only</option>
                                <option value="offline">In-person Only</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                                PASSWORD
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={inputStyle}
                                placeholder="Password"
                                onFocus={e => (e.target.style.borderColor = '#ffffff')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: loading ? '#aaaaaa' : '#ffffff',
                                color: '#000000',
                                border: 'none',
                                borderRadius: '2rem',
                                padding: '0.75rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginTop: '0.5rem',
                                transition: 'all 0.25s ease',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            }}
                            onMouseEnter={e => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#e5e5e5';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#ffffff';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
                                }
                            }}
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1.25rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

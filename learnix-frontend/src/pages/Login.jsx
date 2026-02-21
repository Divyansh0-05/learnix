import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import StarryBackground from '../components/common/StarryBackground';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Added error state
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, authLoading, navigate]);

    if (authLoading) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Login failed. Please try again.');
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
                <title>Login — Learnix</title>
            </Helmet>
            <StarryBackground />
            <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '100vh',
                minHeight: '100dvh', // Modern dynamic viewport height
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem 1rem', // Reduced padding for mobile fit
                overflowX: 'hidden'
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
                        Welcome back
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                        Sign in to your Learnix account
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
                            <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                                <Link
                                    to="/forgot-password"
                                    style={{
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '0.75rem',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                                >
                                    Forgot password?
                                </Link>
                            </div>
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
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1.25rem' }}>
                        Don&apos;t have an account?{' '}
                        <Link to="/register" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

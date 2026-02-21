import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import StarryBackground from '../components/common/StarryBackground';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await forgotPassword(email);
        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error);
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
                <title>Forgot Password — Learnix</title>
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
                        to="/login"
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
                        <FiArrowLeft /> Back to Login
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
                        Forgot password?
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                        Enter your email to receive a reset link.
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

                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(16,185,129,0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                                color: '#10b981'
                            }}>
                                <FiMail size={24} />
                            </div>
                            <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                A reset link has been sent to your email. Please check your inbox.
                            </p>
                            <Link
                                to="/login"
                                style={{
                                    display: 'block',
                                    background: '#ffffff',
                                    color: '#000000',
                                    padding: '0.75rem',
                                    borderRadius: '2rem',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    transition: 'all 0.25s'
                                }}
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
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
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

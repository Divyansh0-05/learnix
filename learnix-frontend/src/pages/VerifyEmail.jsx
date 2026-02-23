import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarryBackground from '../components/common/StarryBackground';
import '../styles/AuthLayout.css';

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        let mounted = true;

        const verify = async () => {
            if (!token) {
                if (!mounted) return;
                setStatus('error');
                setMessage('Verification token is missing.');
                return;
            }

            try {
                const response = await api.post('/auth/verify-email', { token });
                if (!mounted) return;
                setStatus('success');
                setMessage(response.data?.message || 'Email verified successfully.');
            } catch (error) {
                if (!mounted) return;
                setStatus('error');
                setMessage(error.response?.data?.error || 'Email verification failed.');
            }
        };

        verify();

        return () => {
            mounted = false;
        };
    }, [token]);

    const cardStyle = {
        width: '100%',
        maxWidth: '520px',
        background: 'rgba(10,10,15,0.9)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '1rem',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
    };

    return (
        <>
            <Helmet>
                <title>Verify Email - Learnix</title>
            </Helmet>
            <StarryBackground />
            <div className="auth-page-wrapper">
                <div className="auth-card-container" style={cardStyle}>
                    {status === 'loading' && (
                        <>
                            <FiLoader style={{ fontSize: '2rem', color: '#93c5fd', marginBottom: '0.8rem' }} />
                            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Verifying Email</h1>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <FiCheckCircle style={{ fontSize: '2rem', color: '#34d399', marginBottom: '0.8rem' }} />
                            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Email Verified</h1>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <FiAlertCircle style={{ fontSize: '2rem', color: '#f87171', marginBottom: '0.8rem' }} />
                            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Verification Failed</h1>
                        </>
                    )}

                    <p style={{ marginTop: '0.8rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
                        {message}
                    </p>

                    {status !== 'loading' && (
                        <div style={{ marginTop: '1rem' }}>
                            {status === 'success' && (
                                <button
                                    type="button"
                                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                                    style={{
                                        background: '#fff',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '999px',
                                        padding: '0.7rem 1.2rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
                                </button>
                            )}
                            {status === 'error' && (
                                <Link
                                    to="/login"
                                    style={{
                                        display: 'inline-block',
                                        background: '#fff',
                                        color: '#000',
                                        textDecoration: 'none',
                                        borderRadius: '999px',
                                        padding: '0.7rem 1.2rem',
                                        fontWeight: 700
                                    }}
                                >
                                    Back to Login
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

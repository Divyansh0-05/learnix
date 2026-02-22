import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiMail, FiClock, FiShield, FiX, FiChevronLeft } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user: currentUser } = useAuth();
    const { id } = useParams(); // If viewing someone else's profile

    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const isOwnProfile = !id || id === currentUser?._id;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                if (isOwnProfile) {
                    setProfileUser(currentUser);
                } else {
                    const res = await api.get(`/users/${id}`);
                    setProfileUser(res.data.data.user);
                }
            } catch (err) {
                setError('Profile not found.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, currentUser, isOwnProfile]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading profile...</div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error || 'User not found'}</div>
            </div>
        );
    }

    const handleProfileUpdate = (updatedUser) => {
        setProfileUser(updatedUser);
        setIsEditing(false);
    };

    return (
        <>
            <Helmet>
                <title>{profileUser.name} — Profile | Learnix</title>
            </Helmet>

            <div style={{ minHeight: '100vh', background: '#000000', paddingTop: '80px', paddingBottom: '4rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <Link
                            to="/dashboard"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                color: 'rgba(255,255,255,0.4)',
                                textDecoration: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                        >
                            <FiChevronLeft size={12} /> Back to Dashboard
                        </Link>
                    </div>

                    {/* Header Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '1.5rem',
                        padding: '2.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        marginBottom: '2rem'
                    }}>
                        {/* Background mesh/glow */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '300px',
                            height: '300px',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
                            transform: 'translate(30%, -30%)',
                            pointerEvents: 'none'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', position: 'relative', zIndex: 1 }}>
                            {/* Avatar */}
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '2.5rem',
                                flexShrink: 0
                            }}>
                                {profileUser.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
                                            {profileUser.name}
                                        </h1>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                            {profileUser.location && profileUser.location.city && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <FiMapPin /> {profileUser.location.city}{profileUser.location.country ? `, ${profileUser.location.country}` : ''}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <FiClock /> Member since {new Date(profileUser.createdAt).getFullYear()}
                                            </span>
                                        </div>
                                    </div>

                                    {isOwnProfile && (
                                        <button style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                            onClick={() => setIsEditing(true)}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '0.3rem 0.75rem',
                                        borderRadius: '2rem',
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.7)',
                                        textTransform: 'capitalize'
                                    }}>
                                        <FiShield size={12} /> {profileUser.role}
                                    </span>
                                    {isOwnProfile && (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '0.3rem 0.75rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.75rem',
                                            color: 'rgba(255,255,255,0.7)',
                                        }}>
                                            <FiMail size={12} /> {profileUser.email}
                                        </span>
                                    )}
                                </div>

                                {profileUser.bio && (
                                    <div style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '600px' }}>
                                        {profileUser.bio}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                        {/* Teaching */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '1.25rem',
                            padding: '2rem',
                        }}>
                            <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                Can Teach
                            </h2>
                            {profileUser.skillsOffered?.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {profileUser.skillsOffered.map((skill, i) => (
                                        <span key={i} style={{
                                            background: 'rgba(16,185,129,0.1)',
                                            border: '1px solid rgba(16,185,129,0.2)',
                                            color: '#34d399',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 500
                                        }}>
                                            {skill.skillName}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No skills listed yet.</p>
                            )}
                        </div>

                        {/* Learning */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '1.25rem',
                            padding: '2rem',
                        }}>
                            <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                                Wants to Learn
                            </h2>
                            {profileUser.skillsWanted?.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {profileUser.skillsWanted.map((skill, i) => (
                                        <span key={i} style={{
                                            background: 'rgba(59,130,246,0.1)',
                                            border: '1px solid rgba(59,130,246,0.2)',
                                            color: '#60a5fa',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 500
                                        }}>
                                            {skill.skillName}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No skills listed yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <EditProfileModal
                    user={profileUser}
                    onClose={() => setIsEditing(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </>
    );
}

// Inline Edit Modal Component
function EditProfileModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        city: user.location?.city || '',
        country: user.location?.country || '',
        bio: user.bio || ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.put('/users/profile', {
                name: formData.name,
                bio: formData.bio,
                location: {
                    city: formData.city,
                    country: formData.country
                }
            });
            toast.success('Profile updated successfully');
            onUpdate(res.data.data.user);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#0a0a0f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '500px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>Edit Profile</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                        <input
                            type="text"
                            required
                            autoComplete="off"
                            name="profile_name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Full Name"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.5rem', outline: 'none', fontSize: '0.9rem', fontWeight: 400, transition: 'border-color 0.2s' }}
                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>City</label>
                            <input
                                type="text"
                                autoComplete="off"
                                name="profile_city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="City"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.5rem', outline: 'none', fontSize: '0.9rem', fontWeight: 400, transition: 'border-color 0.2s' }}
                                onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>Country</label>
                            <input
                                type="text"
                                autoComplete="off"
                                name="profile_country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                placeholder="Country"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.5rem', outline: 'none', fontSize: '0.9rem', fontWeight: 400, transition: 'border-color 0.2s' }}
                                onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>Bio</label>
                        <textarea
                            rows={3}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell the community a bit about yourself..."
                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.5rem', outline: 'none', resize: 'vertical', fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.6, transition: 'border-color 0.2s' }}
                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.5rem', background: '#fff', color: '#000', border: 'none', borderRadius: '2rem', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem', opacity: submitting ? 0.7 : 1, transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

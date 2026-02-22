import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaCheck, FaTimes, FaComment, FaSearch, FaArrowRight, FaClock, FaChevronLeft } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import * as matchService from '../services/matchService';
import * as requestService from '../services/requestService';

const Matches = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('suggested');
    const [subTab, setSubTab] = useState('received'); // For requests tab
    const [loading, setLoading] = useState(true);
    const [connectModalData, setConnectModalData] = useState(null);

    // Data States
    const [suggestedMatches, setSuggestedMatches] = useState([]);
    const [requests, setRequests] = useState({ received: [], sent: [] });
    const [activeMatches, setActiveMatches] = useState([]);

    useEffect(() => {
        loadData();
    }, [activeTab, subTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'suggested') {
                const data = await matchService.findMatches();
                setSuggestedMatches(data.matches || []);
            } else if (activeTab === 'requests') {
                const data = await requestService.getPendingRequests(subTab);
                setRequests(prev => ({ ...prev, [subTab]: data[subTab] || [] }));
            } else if (activeTab === 'active') {
                const data = await matchService.getMyMatches('active');
                setActiveMatches(data.matches || []);
            }
        } catch (error) {
            console.error('Error loading matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequestClick = (matchId, userId, name) => {
        setConnectModalData({ matchId, userId, name });
    };

    const submitConnectRequest = async (message) => {
        if (!connectModalData) return;
        try {
            await requestService.sendRequest(connectModalData.matchId, connectModalData.userId, message);
            toast.success('Request sent successfully!');
            setConnectModalData(null);
            loadData(); // Refresh
        } catch (error) {
            toast.error(error.error || 'Failed to send request');
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await requestService.acceptRequest(requestId);
            toast.success('Request accepted! You can now chat.');
            loadData();
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to decline this request?')) return;
        try {
            await requestService.declineRequest(requestId, 'Declined by user');
            toast.success('Request declined');
            loadData();
        } catch (error) {
            toast.error('Failed to decline request');
        }
    };

    const handleCancelRequest = async (requestId) => {
        if (!window.confirm('Cancel this sent request?')) return;
        try {
            await requestService.cancelRequest(requestId);
            toast.success('Request cancelled');
            loadData();
        } catch (error) {
            toast.error('Failed to cancel request');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#000000', padding: '7rem 2rem 4rem' }}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <div>
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
                                marginBottom: '1rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                        >
                            <FaChevronLeft size={10} /> Back to Dashboard
                        </Link>
                        <p style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            Connections
                        </p>
                        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em' }}>
                            Matchmaking
                        </h1>
                    </div>
                </div>

                {/* Main Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '2rem', width: 'fit-content', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('suggested')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '2rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            background: activeTab === 'suggested' ? '#ffffff' : 'transparent',
                            color: activeTab === 'suggested' ? '#000000' : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        Suggested Matches
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '2rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            background: activeTab === 'requests' ? '#ffffff' : 'transparent',
                            color: activeTab === 'requests' ? '#000000' : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '2rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            background: activeTab === 'active' ? '#ffffff' : 'transparent',
                            color: activeTab === 'active' ? '#000000' : 'rgba(255,255,255,0.5)',
                        }}
                    >
                        Active Connections
                    </button>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
                ) : (
                    <>
                        {/* Suggested Matches */}
                        {activeTab === 'suggested' && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {suggestedMatches.length === 0 ? (
                                    <div className="col-span-full text-center py-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        <p>No new matches found at the moment.</p>
                                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Try adding more skills to your profile!</p>
                                    </div>
                                ) : (
                                    suggestedMatches.map(match => (
                                        <div key={match.id} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '1rem',
                                            padding: '1.5rem',
                                            transition: 'all 0.2s'
                                        }}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div style={{
                                                        width: '40px', height: '40px',
                                                        borderRadius: '50%',
                                                        background: 'rgba(255,255,255,0.1)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#ffffff', fontWeight: 800, fontSize: '1.2rem'
                                                    }}>
                                                        {match.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{match.user.name}</h3>
                                                            {match.user.bio && (
                                                                <div className="group relative flex items-center">
                                                                    <FiInfo size={14} color="rgba(255,255,255,0.4)" className="cursor-pointer hover:text-white transition" />
                                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-white/90 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                                                                        {match.user.bio}
                                                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-[#1a1a1a] border-b border-r border-white/10 rotate-45 -mt-1 hidden sm:block"></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75rem', color: '#10b981', fontWeight: 600,
                                                            background: 'rgba(16, 185, 129, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '1rem', width: 'fit-content', marginTop: '0.2rem'
                                                        }}>
                                                            {match.matchScore}% Match
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                <div>
                                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>They Offer:</p>
                                                    <div className="flex flex-col gap-2">
                                                        {match.user.skillsOffered.map(s => (
                                                            <div key={s._id} style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{s.skillName}</span>
                                                                    <span style={{ fontSize: '0.65rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{s.level}</span>
                                                                </div>
                                                                {s.description && (
                                                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, marginTop: '0.25rem' }}>{s.description}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>They Want:</p>
                                                    <div className="flex flex-col gap-2">
                                                        {match.user.skillsWanted.map(s => (
                                                            <div key={s._id} style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{s.skillName}</span>
                                                                    <span style={{ fontSize: '0.65rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{s.level}</span>
                                                                </div>
                                                                {s.description && (
                                                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, marginTop: '0.25rem' }}>{s.description}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {match.matchStatus !== 'active' && match.matchStatus !== 'pending' ? (
                                                <button
                                                    onClick={() => handleSendRequestClick(match.matchId, match.user.id, match.user.name)}
                                                    style={{
                                                        width: '100%', padding: '0.75rem', background: '#ffffff', color: '#000000', borderRadius: '2rem', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                                                >
                                                    <FaUserPlus className="mr-2" /> Connect
                                                </button>
                                            ) : (
                                                <button disabled style={{
                                                    width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: '2rem', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'not-allowed'
                                                }}>
                                                    {match.matchStatus === 'active' ? 'Matched' : 'Request Pending'}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Requests */}
                        {activeTab === 'requests' && (
                            <div>
                                <div className="flex space-x-6 border-b border-gray-800 mb-6">
                                    <button
                                        onClick={() => setSubTab('received')}
                                        style={{
                                            paddingBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, borderBottom: subTab === 'received' ? '2px solid #ffffff' : '2px solid transparent', color: subTab === 'received' ? '#ffffff' : 'rgba(255,255,255,0.5)'
                                        }}
                                    >
                                        Received
                                    </button>
                                    <button
                                        onClick={() => setSubTab('sent')}
                                        style={{
                                            paddingBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, borderBottom: subTab === 'sent' ? '2px solid #ffffff' : '2px solid transparent', color: subTab === 'sent' ? '#ffffff' : 'rgba(255,255,255,0.5)'
                                        }}
                                    >
                                        Sent
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {requests[subTab] && requests[subTab].length === 0 ? (
                                        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem 0' }}>No {subTab} requests.</p>
                                    ) : (
                                        requests[subTab] && requests[subTab].map(req => {
                                            const sender = subTab === 'received' ? req.sender : null;
                                            const receiver = subTab === 'sent' ? req.receiver : null;
                                            const displayUser = sender || receiver || { name: 'Unknown' };

                                            return (
                                                <div key={req.id} style={{
                                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: '1rem'
                                                }} className="md:flex-row">
                                                    <div className="flex items-center space-x-4 w-full md:w-auto">
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800
                                                        }}>
                                                            {displayUser.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <span style={{ fontWeight: 700, color: '#ffffff' }}>
                                                                {displayUser.name}
                                                            </span>
                                                            {req.message && (
                                                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem', fontStyle: 'italic' }}>"{req.message}"</p>
                                                            )}
                                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', display: 'flex', alignItems: 'center' }}>
                                                                <FaClock className="mr-1" /> {new Date(req.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-3 w-full md:w-auto mt-4 md:mt-0">
                                                        {subTab === 'received' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAcceptRequest(req.id)}
                                                                    style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                                                >
                                                                    <FaCheck className="mr-1" /> Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeclineRequest(req.id)}
                                                                    style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                                                >
                                                                    <FaTimes className="mr-1" /> Decline
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCancelRequest(req.id)}
                                                                style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                                                            >
                                                                Cancel Request
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Active Matches */}
                        {activeTab === 'active' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {activeMatches.length === 0 ? (
                                    <div className="col-span-full text-center py-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        <p>No active connections yet.</p>
                                        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Accept requests or get your requests accepted to start chatting!</p>
                                    </div>
                                ) : (
                                    activeMatches.map(match => (
                                        <div key={match.id} style={{
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s'
                                        }}>
                                            <div className="flex items-center space-x-4">
                                                <div style={{
                                                    width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 800, fontSize: '1.2rem', position: 'relative'
                                                }}>
                                                    {match.otherUser.name.charAt(0)}
                                                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10b981', border: '2px solid #000', borderRadius: '50%' }}></span>
                                                </div>
                                                <div>
                                                    <h3 style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.1rem' }}>{match.otherUser.name}</h3>
                                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>Connected since {new Date(match.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/chat/${match.id}`)}
                                                style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '2rem', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                            >
                                                <FaComment className="mr-2" /> Chat
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Connect Modal */}
            {connectModalData && (
                <ConnectModal
                    data={connectModalData}
                    onClose={() => setConnectModalData(null)}
                    onSubmit={submitConnectRequest}
                />
            )}
        </div>
    );
};

// Inline Connect Modal Component
function ConnectModal({ data, onClose, onSubmit }) {
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await onSubmit(message);
        setSubmitting(false);
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
                maxWidth: '450px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>Connect with {data.name}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                        <FaTimes size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>Add a note (optional)</label>
                        <textarea
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Hi! I'd love to swap skills with you..."
                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '0.5rem', outline: 'none', resize: 'vertical', fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.6, transition: 'border-color 0.2s' }}
                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.5rem', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '2rem', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem', opacity: submitting ? 0.7 : 1, transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                            {submitting ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Matches;

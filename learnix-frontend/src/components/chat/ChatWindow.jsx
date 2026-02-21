import React, { useRef, useEffect, useState } from 'react';
import { FiCheck, FiMoreVertical } from 'react-icons/fi';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MessageInput from './MessageInput';
import { blockUser, unblockUser, reportUser } from '../../services/userService';

const ChatWindow = ({ matchId, onBack }) => {
    const { messages, loading, sendMessage, sendTyping, typingUsers, matchDetails } = useChat(matchId);
    const { user } = useAuth();
    const { onlineUsers } = useSocket();
    const messagesEndRef = useRef(null);

    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [reportReason, setReportReason] = useState('inappropriate_behavior');
    const [reportDesc, setReportDesc] = useState('');
    const [hasBlockedThisMatch, setHasBlockedThisMatch] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4" style={{ background: '#030307' }}>
                <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin"></div>
                <p className="text-white/40 font-medium">Loading conversation...</p>
            </div>
        );
    }

    // Determine the other user's name and status
    const isOtherTyping = typingUsers.size > 0;
    const otherUser = matchDetails ? (
        String(matchDetails.user1._id || matchDetails.user1) === String(user?._id || user?.id)
            ? matchDetails.user2
            : matchDetails.user1
    ) : null;

    const otherUserId = String(otherUser?._id || otherUser?.id);
    const currentIsBlocked = user?.blockedUsers?.some(b => String(b) === otherUserId) || hasBlockedThisMatch;

    const handleBlock = () => {
        if (currentIsBlocked) return;
        setShowBlockModal(true);
        setShowMenu(false);
    };

    const confirmBlock = async () => {
        try {
            await blockUser(otherUserId);

            // Update local context/state
            if (user?.blockedUsers) {
                user.blockedUsers.push(otherUserId);
            }
            setHasBlockedThisMatch(true);
            setShowBlockModal(false);
        } catch (error) {
            console.error('Error blocking user:', error);
            alert('Failed to block user. Please try again.');
        }
    };

    const handleUnblock = async () => {
        if (!currentIsBlocked) return;

        try {
            await unblockUser(otherUserId);

            // Update local context/state
            if (user?.blockedUsers) {
                user.blockedUsers = user.blockedUsers.filter(id => String(id) !== otherUserId);
            }
            setHasBlockedThisMatch(false);
            setShowMenu(false);
        } catch (error) {
            console.error('Error unblocking user:', error);
            alert('Failed to unblock user. Please try again.');
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await reportUser(otherUserId, { reason: reportReason, description: reportDesc });
            setShowReportModal(false);
            setShowMenu(false);
            setReportDesc('');
            alert('Report submitted successfully. Our team will review it shortly.');
        } catch (error) {
            console.error('Error reporting user:', error);
            alert(error.response?.data?.error || 'Failed to submit report.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <div className="p-5 border-b flex items-center backdrop-blur-xl sticky top-0 z-[100] overflow-visible"
                style={{ background: 'rgba(5, 5, 10, 0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <button
                    onClick={onBack}
                    className="md:hidden mr-4 text-white p-2 rounded-full hover:bg-white/10 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#1e1e2e] flex items-center justify-center font-bold text-white border border-white/10 shadow-sm overflow-hidden">
                        {otherUser?.avatar ? (
                            <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover" />
                        ) : (
                            otherUser?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-lg tracking-tight leading-none mb-1">
                            {otherUser?.name || 'Chat User'}
                        </span>
                        <div className="flex items-center space-x-2 h-4">
                            {isOtherTyping ? (
                                <span className="text-xs text-[#60a5fa] font-medium animate-pulse">Typing...</span>
                            ) : (
                                <>
                                    <div
                                        className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                                        style={{
                                            backgroundColor: (otherUser && onlineUsers.has(String(otherUser.id || otherUser._id))) ? '#10b981' : 'rgba(255,255,255,0.15)'
                                        }}
                                    ></div>
                                    <span className="text-xs text-white/40 font-medium">
                                        {(otherUser && onlineUsers.has(String(otherUser.id || otherUser._id))) ? 'Online' : 'Offline'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3-Dot Menu */}
                <div className="ml-auto relative z-[110]">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition"
                    >
                        <FiMoreVertical size={20} />
                    </button>
                    {showMenu && (
                        <div
                            className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl py-1 z-[120] border border-white/10"
                            style={{ background: '#1e1e2e', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                        >
                            {currentIsBlocked ? (
                                <button
                                    onClick={handleUnblock}
                                    className="w-full text-left px-4 py-3 text-sm text-[#10b981] hover:bg-white/5 transition font-medium"
                                >
                                    Unblock User
                                </button>
                            ) : (
                                <button
                                    onClick={handleBlock}
                                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-white/5 transition font-medium"
                                >
                                    Block User
                                </button>
                            )}
                            <button
                                onClick={() => { setShowMenu(false); setShowReportModal(true); }}
                                className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition"
                            >
                                Report User
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
                style={{ background: '#050508' }}>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-20">
                        <p className="text-sm text-white">No messages here yet</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const currentUserId = user._id || user.id;
                        const senderId = msg.sender._id || msg.sender.id || msg.sender;
                        const isOwn = currentUserId.toString() === senderId.toString();

                        return (
                            <div
                                key={msg._id || msg.tempId}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-5 py-3 transition-all duration-200 ${isOwn ? 'rounded-tr-none' : 'rounded-tl-none'
                                        }`}
                                    style={{
                                        background: isOwn ? '#ffffff' : '#1a1a24',
                                        color: isOwn ? '#000000' : '#ffffff',
                                        border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                        boxShadow: isOwn ? '0 4px 15px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    <p className="leading-relaxed whitespace-pre-wrap select-text text-[15px]">
                                        {msg.message}
                                    </p>
                                    <div className={`text-[10px] mt-1.5 flex items-center justify-end space-x-1 ${isOwn ? 'text-black/40' : 'text-white/30'
                                        }`}>
                                        <span className="font-medium">
                                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isOwn && (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {msg.isRead ? (
                                                    <div style={{ display: 'flex', marginLeft: '2px' }}>
                                                        <FiCheck size={12} style={{ color: '#60a5fa' }} />
                                                        <FiCheck size={12} style={{ color: '#60a5fa', marginLeft: '-6px' }} />
                                                    </div>
                                                ) : (
                                                    <FiCheck size={12} style={{ color: 'rgba(0,0,0,0.2)', marginLeft: '2px' }} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Traditional Typing Indicator in flow */}
                {isOtherTyping && (
                    <div className="flex justify-start">
                        <div className="bg-[#1a1a24] rounded-2xl p-3 flex items-center space-x-1.5 border border-white/5">
                            <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 border-t backdrop-blur-xl"
                style={{ background: 'rgba(5, 5, 10, 0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
                {currentIsBlocked ? (
                    <div className="w-full py-4 text-center rounded-xl bg-[#1a1a24] border border-white/5 text-white/50 text-sm">
                        You have blocked this user. You cannot send or receive messages.
                    </div>
                ) : (
                    <MessageInput onSend={sendMessage} onTyping={sendTyping} />
                )}
            </div>

            {/* Block Confirmation Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-[#111111] rounded-2xl border border-white/10 p-6 shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Block {otherUser?.name}?</h3>
                        <p className="text-sm text-white/60 mb-6">
                            You will no longer be able to message them, and they will not be able to interact with your account.
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBlock}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-medium"
                            >
                                Block User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#111111] rounded-2xl border border-white/10 p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Report {otherUser?.name}</h3>
                        <p className="text-sm text-white/60 mb-6">Our trust and safety team will review this report and take appropriate action. We do not notify the user who reported them.</p>

                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Reason for reporting</label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#60a5fa] appearance-none"
                                >
                                    <option value="inappropriate_behavior">Inappropriate Behavior</option>
                                    <option value="harassment">Harassment or Bullying</option>
                                    <option value="spam">Spam or Scam</option>
                                    <option value="fake_profile">Fake Profile</option>
                                    <option value="skill_misrepresentation">Skill Misrepresentation</option>
                                    <option value="no_show">No-Show / Flaking</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Additional details</label>
                                <textarea
                                    value={reportDesc}
                                    onChange={(e) => setReportDesc(e.target.value)}
                                    placeholder="Please provide more specifics..."
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#60a5fa] h-24 resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowReportModal(false); setReportDesc(''); }}
                                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reportDesc.trim()}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Reporting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;

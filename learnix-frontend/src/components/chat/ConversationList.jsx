import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ConversationList = ({ activeMatchId, onSelect }) => {
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { onlineUsers, typingMatches, socket, matches, setMatches, setActiveMatchId } = useSocket();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await api.get('/chat/list');
                // Store in socket context so it persists across navigation
                setMatches(response.data.data.chatList);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [setMatches]);

    const conversations = matches;

    useEffect(() => {
        setActiveMatchId(activeMatchId);
    }, [activeMatchId, setActiveMatchId]);
    // Sidebar now purely reactive to the global 'matches' state in SocketContext
    useEffect(() => {
        if (!socket) return;
        // Global listeners for 'new_message', 'new_message_notification', 
        // and 'messages_read' are now handled in SocketContext.jsx
    }, [socket]);

    if (loading) {
        return <div className="p-4 text-center text-white/30">Loading conversations...</div>;
    }

    if (conversations.length === 0) {
        return (
            <div className="p-10 text-center text-white/20">
                <p className="font-bold">No chats yet</p>
                <p className="text-xs mt-1">Matched people will appear here</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 border-b border-white/5">
                <Link
                    to="/dashboard"
                    className="flex items-center text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest mb-4 transition-colors group w-fit"
                >
                    <FiChevronLeft className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
            </div>
            <div className="p-2 space-y-1">
                {conversations.map((conv) => {
                    const matchIdStr = String(conv.matchId);
                    return (
                        <div
                            key={matchIdStr}
                            onClick={() => onSelect(conv.matchId)}
                            className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 relative group flex items-center space-x-3 ${activeMatchId === conv.matchId
                                ? 'bg-white/5 border border-white/10'
                                : 'hover:bg-white/[0.03] border border-transparent'
                                }`}
                        >
                            <div className="relative flex-shrink-0">
                                {conv.otherUser.avatar ? (
                                    <img
                                        src={conv.otherUser.avatar}
                                        alt={conv.otherUser.name}
                                        className="h-12 w-12 rounded-full object-cover border border-white/10"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-white bg-[#1e1e2e] border border-white/10">
                                        {conv.otherUser.name.charAt(0)}
                                    </div>
                                )}
                                <div
                                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#08080c] transition-colors duration-300"
                                    style={{
                                        backgroundColor: onlineUsers.has(String(conv.otherUser.id || conv.otherUser._id)) ? '#10b981' : 'rgba(255,255,255,0.15)'
                                    }}
                                ></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-bold text-white truncate">
                                        {conv.otherUser.name}
                                    </h3>
                                    {conv.lastMessage && (
                                        <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">
                                            {new Date(conv.lastMessage.createdAt || new Date()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                    {typingMatches[matchIdStr]?.size > 0 ? (
                                        <p className="text-xs text-[#60a5fa] font-semibold animate-pulse">
                                            Typing...
                                        </p>
                                    ) : (
                                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white font-semibold' : 'text-white/40'}`}>
                                            {conv.lastMessage ? conv.lastMessage.message : 'Say hello!'}
                                        </p>
                                    )}
                                    {conv.unreadCount > 0 && !(typingMatches[matchIdStr]?.size > 0) && (
                                        <span className="h-4 w-4 bg-white text-black text-[10px] font-bold flex items-center justify-center rounded-full leading-none">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationList;

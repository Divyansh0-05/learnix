import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingMatches, setTypingMatches] = useState({}); // matchId -> Set(userIds)
    const [matches, setMatches] = useState([]); // Global reactive matches list
    const [activeMatchId, _setActiveMatchId] = useState(null); // Currently viewed match
    const activeMatchRef = React.useRef(null);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const setActiveMatchId = (id) => {
        activeMatchRef.current = id;
        _setActiveMatchId(id);
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            const token = localStorage.getItem('accessToken');
            const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

            const newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket'],
            });

            newSocket.on('connect', () => {

                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {

                setIsConnected(false);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            newSocket.on('joined_matches', ({ onlineUsers: initialOnlineUsers }) => {
                setOnlineUsers(new Set(initialOnlineUsers.map(id => String(id))));
            });

            newSocket.on('user_status', ({ userId, status }) => {
                const idStr = String(userId);
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    if (status === 'online') next.add(idStr);
                    else next.delete(idStr);
                    return next;
                });
            });

            newSocket.on('user_typing', ({ matchId, isTyping, userId }) => {
                const midStr = String(matchId);
                const uidStr = String(userId);

                // Don't show typing indicator for yourself
                if (uidStr === String(user?._id || user?.id)) return;

                setTypingMatches(prev => {
                    const currentSet = new Set(prev[midStr] || []);
                    if (isTyping) {
                        currentSet.add(uidStr);
                    } else {
                        currentSet.delete(uidStr);
                    }

                    return {
                        ...prev,
                        [midStr]: currentSet
                    };
                });
            });

            newSocket.on('match_activated', ({ match }) => {

                setMatches(prev => {
                    const exists = prev.some(m => String(m.matchId || m._id) === String(match._id || match.id));
                    if (exists) return prev;

                    const otherUser = String(match.user1._id || match.user1) === String(user?._id || user?.id)
                        ? match.user2
                        : match.user1;

                    return [{
                        matchId: match._id,
                        otherUser: {
                            id: otherUser._id || otherUser,
                            name: otherUser.name || 'Chat User',
                            avatar: otherUser.avatar,
                            lastActive: otherUser.lastActive
                        },
                        lastMessage: null,
                        unreadCount: 0,
                        lastInteractionAt: match.lastInteractionAt || new Date().toISOString()
                    }, ...prev];
                });
            });

            const handleIncomingMessage = (payload) => {
                const isDirect = !!payload.match;
                const matchId = isDirect ? payload.match : payload.matchId;
                const message = isDirect ? payload : payload.message;
                const midStr = String(matchId);
                const currentActive = activeMatchRef.current;
                const isActive = currentActive && String(currentActive) === midStr;

                setMatches(prev => {
                    const exists = prev.some(conv => String(conv.matchId || conv._id) === midStr);
                    if (!exists) return prev;

                    return prev.map(conv => {
                        if (String(conv.matchId || conv._id) === midStr) {
                            return {
                                ...conv,
                                lastMessage: {
                                    id: message._id,
                                    message: message.message,
                                    sender: message.sender,
                                    createdAt: message.createdAt,
                                    isRead: message.isRead
                                },
                                // Only increment unread if NOT the sender AND NOT currently viewing this chat
                                unreadCount: (String(message.sender._id || message.sender) !== String(user?._id || user?.id)) && !isActive
                                    ? (conv.unreadCount || 0) + 1
                                    : (conv.unreadCount || 0),
                                lastInteractionAt: new Date().toISOString()
                            };
                        }
                        return conv;
                    }).sort((a, b) => new Date(b.lastInteractionAt) - new Date(a.lastInteractionAt));
                });

                // AUTO-CLEAR TYPING: Highly defensive sender ID extraction
                const senderObj = message.sender || {};
                const senderId = String(senderObj._id || senderObj.id || senderObj);

                setTypingMatches(prev => {
                    const currentSet = new Set(prev[midStr] || []);
                    if (currentSet.has(senderId)) {
                        const nextSet = new Set(currentSet);
                        nextSet.delete(senderId);
                        return { ...prev, [midStr]: nextSet };
                    }
                    return prev;
                });

                // GLOBAL TOAST NOTIFICATION
                const isFromMe = String(message.sender._id || message.sender) === String(user?._id || user?.id);
                if (!isFromMe && !isActive) {
                    const senderName = message.sender?.name || 'New Message';
                    const senderAvatar = message.sender?.avatar;

                    toast.custom((t) => (
                        <div
                            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                                } max-w-md w-full bg-[#111] border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex py-4 px-5 ring-1 ring-black ring-opacity-5 cursor-pointer hover:bg-[#181818] transition-colors`}
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate(`/chat/${midStr}`);
                            }}
                        >
                            <div className="flex-1 w-0">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        {senderAvatar ? (
                                            <img className="h-10 w-10 rounded-full" src={senderAvatar} alt="" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                                <FiMessageSquare className="text-white/40" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-white">
                                            {senderName}
                                        </p>
                                        <p className="mt-1 text-sm text-white/50 line-clamp-1">
                                            {message.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex items-center">
                                <span className="text-xs text-white/20">Now</span>
                            </div>
                        </div>
                    ), {
                        duration: 5000,
                        position: 'top-right'
                    });
                }
            };

            newSocket.on('new_message', handleIncomingMessage);
            newSocket.on('new_message_notification', handleIncomingMessage);

            newSocket.on('messages_read', ({ matchId }) => {
                setMatches(prev => prev.map(conv =>
                    String(conv.matchId || conv._id) === String(matchId) ? { ...conv, unreadCount: 0 } : conv
                ));
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }, [isAuthenticated, user]);

    // Dedicated effect to clear unread counts when active match changes
    useEffect(() => {
        if (activeMatchId) {
            setMatches(prev => prev.map(conv =>
                String(conv.matchId || conv._id) === String(activeMatchId) ? { ...conv, unreadCount: 0 } : conv
            ));
        }
    }, [activeMatchId]);

    const value = {
        socket,
        isConnected,
        onlineUsers,
        typingMatches,
        matches,
        setMatches,
        activeMatchId,
        setActiveMatchId
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

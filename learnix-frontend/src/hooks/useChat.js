import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useChat = (matchId) => {
    const { socket, setActiveMatchId } = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [matchDetails, setMatchDetails] = useState(null);
    const { typingMatches } = useSocket();

    // Fetch initial chat history
    useEffect(() => {
        if (!matchId) {
            setActiveMatchId(null);
            return;
        }

        setActiveMatchId(matchId);

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/chat/${matchId}`);
                setMessages(response.data.data.messages);
                // We also need the match details (users) to display the header
                // The API endpoint /chat/:matchId returns { success: true, data: { match, messages } }
                // where 'match' contains populated user1 and user2
                setMatchDetails(response.data.data.match);
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
                // Error handling is managed by the global axios interceptor
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [matchId]);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket || !matchId) return;

        // Join the match room
        socket.emit('join_match', matchId);

        // Mark all as read when joining
        socket.emit('mark_read', { matchId });

        const handleNewMessage = (newMessage) => {
            // Only add if it belongs to this match
            if (newMessage.match === matchId) {
                setMessages(prev => [...prev, newMessage]);

                const currentUserId = user._id || user.id;
                const senderId = newMessage.sender._id || newMessage.sender.id || newMessage.sender;

                // If message is from other user, mark it as read immediately
                if (currentUserId.toString() !== senderId.toString()) {
                    socket.emit('mark_read', { matchId });
                }
            }
        };


        const handleMessagesRead = ({ readBy, matchId: readMatchId }) => {
            if (readMatchId === matchId) {
                setMessages(currentMessages =>
                    currentMessages.map(msg =>
                        msg.sender._id !== readBy && !msg.isRead
                            ? { ...msg, isRead: true }
                            : msg
                    )
                );
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.emit('leave_match', matchId);
            socket.off('new_message', handleNewMessage);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [socket, matchId, user]);

    const sendMessage = async (text) => {
        if (!text.trim() || !matchId) return;

        const tempId = Date.now().toString();
        // Optimistic update logic could go here, but for now we rely on the socket echo 
        // or the API response to append the message to avoid duplication if we adhere strictly to the "echo" model.
        // However, standard pattern is:
        // 1. Emit socket
        // 2. Socket server saves and broadcasts back 'new_message'

        socket.emit('send_message', {
            matchId,
            message: text,
            tempId
        });

        // Immediately stop typing locally and via socket
        sendTyping(false);
    };

    const sendTyping = (isTyping) => {
        if (!socket || !matchId) return;
        socket.emit('typing', { matchId, isTyping });
    };

    return {
        messages,
        loading,
        sendMessage,
        sendTyping,
        typingUsers: typingMatches[String(matchId)] || new Set(),
        matchDetails
    };
};

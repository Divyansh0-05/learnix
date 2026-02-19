import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useChat = (matchId) => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [matchDetails, setMatchDetails] = useState(null);

    // Fetch initial chat history
    useEffect(() => {
        if (!matchId) return;

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
                toast.error('Could not load messages');
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

        const handleNewMessage = (newMessage) => {
            // Only add if it belongs to this match
            if (newMessage.match === matchId) {
                setMessages(prev => [...prev, newMessage]);

                // If message is from other user, verify read status immediately
                // (Optional: depending on if window is focused)
                // socket.emit('mark_read', { matchId });
            }
        };

        const handleUserTyping = ({ userId, isTyping }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (isTyping) newSet.add(userId);
                else newSet.delete(userId);
                return newSet;
            });
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
        socket.on('user_typing', handleUserTyping);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.emit('leave_match', matchId);
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [socket, matchId]);

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

        socket.emit('typing', { matchId, isTyping: false });
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
        typingUsers,
        matchDetails
    };
};

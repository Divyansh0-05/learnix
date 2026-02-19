import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ConversationList = ({ activeMatchId, onSelect }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await api.get('/chat/list');
                setConversations(response.data.data.chatList);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading chats...</div>;
    }

    if (conversations.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500">
                <p>No active matches yet.</p>
                <p className="text-sm mt-2">Find matches to start chatting!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {conversations.map((conv) => (
                    <div
                        key={conv.matchId}
                        onClick={() => onSelect(conv.matchId)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition ${activeMatchId === conv.matchId ? 'bg-primary-50 hover:bg-primary-50' : ''
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {conv.otherUser.avatar ? (
                                    <img
                                        src={conv.otherUser.avatar}
                                        alt={conv.otherUser.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                        {conv.otherUser.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-sm font-medium ${activeMatchId === conv.matchId ? 'text-primary-900' : 'text-gray-900'} truncate`}>
                                        {conv.otherUser.name}
                                    </h3>
                                    {conv.lastMessage && (
                                        <span className="text-xs text-gray-500">
                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                        {conv.lastMessage ? conv.lastMessage.message : 'Start a conversation'}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConversationList;

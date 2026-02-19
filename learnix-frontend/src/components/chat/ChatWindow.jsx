import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat'; // Ensure correct import path - this assumes hooks folder is sibling to components or similar
// Adjusting import path assuming src/hooks/useChat.js and src/components/chat/ChatWindow.jsx
import { useAuth } from '../../context/AuthContext';
import MessageInput from './MessageInput';

const ChatWindow = ({ matchId, onBack }) => {
    // Note: useChat needs to be imported from valid location.
    // Based on previous step, it was src/hooks/useChat.js
    // Current file location src/components/chat/ChatWindow.jsx
    // So import should be ../../hooks/useChat

    // We need to move useChat to src/hooks/useChat.js if not already there, 
    // or fix the import if I put it somewhere else. 
    // I put it in src/hooks/useChat.js in step 186. So ../../hooks/useChat is correct.

    const { messages, loading, sendMessage, sendTyping, typingUsers, matchDetails } = useChat(matchId);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    if (loading) {
        return <div className="flex-1 flex items-center justify-center">Loading messages...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center">
                <button
                    onClick={onBack}
                    className="md:hidden mr-4 text-gray-600 hover:text-gray-900"
                >
                    ← Back
                </button>
                <div className="flex items-center">
                    {/* Display Other User Name */}
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                            {matchDetails ? (
                                matchDetails.user1._id === user._id || matchDetails.user1 === user._id || (typeof matchDetails.user1 === 'object' && matchDetails.user1._id === user._id)
                                    ? (matchDetails.user2.name || 'Chat User')
                                    : (matchDetails.user1.name || 'Chat User')
                            ) : (
                                'Loading...'
                            )}
                        </span>
                        {/* Status indicator (optional/future) */}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No messages yet.</p>
                        <p className="text-sm">Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        // Handle both _id and id properties, and ensure string comparison
                        const currentUserId = user._id || user.id;
                        const senderId = msg.sender._id || msg.sender.id || msg.sender;
                        const isOwn = currentUserId.toString() === senderId.toString();
                        return (
                            <div
                                key={msg._id || msg.tempId}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${isOwn
                                        ? 'bg-primary-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    <p className="break-words">{msg.message}</p>
                                    <div className={`text-[10px] mt-1 text-right ${isOwn ? 'text-primary-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isOwn && (
                                            <span className="ml-1">
                                                {msg.isRead ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-500 rounded-lg px-4 py-2 text-sm italic">
                            Typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200">
                <MessageInput onSend={sendMessage} onTyping={sendTyping} />
            </div>
        </div>
    );
};

export default ChatWindow;

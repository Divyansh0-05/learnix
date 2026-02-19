import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { useParams, useNavigate } from 'react-router-dom';

const ChatLayout = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const { isConnected } = useSocket();
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'

    useEffect(() => {
        if (matchId) {
            setMobileView('chat');
        } else {
            setMobileView('list');
        }
    }, [matchId]);

    const handleSelectConversation = (id) => {
        navigate(`/chat/${id}`);
    };

    const handleBack = () => {
        navigate('/chat');
    };

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Connecting to chat server...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">
            {/* Sidebar - Hidden on mobile when chat is active */}
            <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col bg-white border-r border-gray-200`}>
                <ConversationList activeMatchId={matchId} onSelect={handleSelectConversation} />
            </div>

            {/* Chat Area - Hidden on mobile when list is active */}
            <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50`}>
                {matchId ? (
                    <ChatWindow matchId={matchId} onBack={handleBack} />
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
                        <div className="text-center">
                            <span className="text-6xl">💬</span>
                            <p className="mt-4 text-lg">Select a conversation to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatLayout;

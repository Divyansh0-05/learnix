import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';

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
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)', marginTop: '64px', background: '#000000' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#ffffff' }}></div>
                    <p className="mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Connecting to chat server...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-[#050508] pb-[4rem] md:pb-0" style={{ paddingTop: '64px' }}>
            {/* Sidebar */}
            <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r z-20`}
                style={{ background: '#08080c', borderColor: 'rgba(255,255,255,0.06)' }}>
                <ConversationList activeMatchId={matchId} onSelect={handleSelectConversation} />
            </div>

            {/* Chat Area */}
            <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative z-10 transition-all duration-300`}
                style={{ background: '#050508' }}>
                {matchId ? (
                    <ChatWindow matchId={matchId} onBack={handleBack} />
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]"></div>

                        <div className="text-center relative z-10 p-8 glass-morphism rounded-3xl border border-white/5 backdrop-blur-sm">
                            <div className="flex justify-center mb-6">
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.3)'
                                }}>
                                    <FiMessageSquare size={40} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Your Conversations</h3>
                            <p className="text-white/40 max-w-xs mx-auto">Select a match from the list to start exchanging skills and knowledge.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatLayout;

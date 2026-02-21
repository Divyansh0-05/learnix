import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const MessageInput = ({ onSend, onTyping }) => {
    const [text, setText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const typingTimeoutRef = useRef(null);
    const pickerRef = useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const onEmojiClick = (emojiObject) => {
        setText((prevText) => prevText + emojiObject.emoji);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSend(text);
            setText('');
            // Stop typing immediately on send
            onTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleChange = (e) => {
        setText(e.target.value);

        onTyping(true);

        // Debounce typing off
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            onTyping(false);
        }, 2000);
    };

    return (
        <div className="relative">
            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
                <div
                    ref={pickerRef}
                    className="absolute bottom-[calc(100%+0.5rem)] right-0 z-[100] bg-black border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
                >
                    <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme={Theme.DARK}
                        searchDisabled={true}
                        skinTonesDisabled={true}
                        width={320}
                        height={400}
                        style={{
                            '--epr-bg-color': '#000000',
                            '--epr-category-label-bg-color': '#000000',
                            border: 'none',
                        }}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex space-x-2 relative w-full items-center">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={text}
                        onChange={handleChange}
                        placeholder="Type a message..."
                        className="w-full rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-0 transition-all text-white placeholder-gray-500"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.95rem',
                            outline: 'none',
                            boxShadow: 'none'
                        }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.3)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />

                    {/* Emoji Toggle Button (Positioned inside the input) */}
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
                        </svg>
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="rounded-full p-2 w-12 h-12 flex-shrink-0 flex items-center justify-center transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    style={{
                        background: '#ffffff',
                        color: '#000000',
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default MessageInput;

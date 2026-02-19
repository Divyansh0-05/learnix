import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSend, onTyping }) => {
    const [text, setText] = useState('');
    const typingTimeoutRef = useRef(null);

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
        <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
                type="text"
                value={text}
                onChange={handleChange}
                placeholder="Type a message..."
                className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2"
            />
            <button
                type="submit"
                disabled={!text.trim()}
                className="bg-primary-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            </button>
        </form>
    );
};

export default MessageInput;

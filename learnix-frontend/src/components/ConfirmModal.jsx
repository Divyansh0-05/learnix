import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // 'danger', 'warning', 'info'
}) => {
    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger': return { primary: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'warning': return { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            default: return { primary: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
        }
    };

    const colors = getColors();

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        }}>
            <div style={{
                background: '#0a0a0f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '400px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaExclamationTriangle color={colors.primary} size={18} />
                        <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{title}</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                        <FaTimes size={18} />
                    </button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        {message}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.6rem 1.25rem',
                                background: 'transparent',
                                color: 'rgba(255,255,255,0.7)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            style={{
                                padding: '0.6rem 1.5rem',
                                background: type === 'danger' ? '#ef4444' : '#ffffff',
                                color: type === 'danger' ? '#ffffff' : '#000000',
                                border: 'none',
                                borderRadius: '2rem',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                transition: 'transform 0.1s, opacity 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

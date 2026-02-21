import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{
            background: '#08080f',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                    Learnix
                </span>

                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
                    © {new Date().getFullYear()} Learnix. All rights reserved.
                </span>
            </div>
        </footer>
    );
}

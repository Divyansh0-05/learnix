import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiInfo, FiStar, FiHelpCircle, FiLogOut, FiGrid } from 'react-icons/fi';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Is the current page the landing page?
    const isHome = location.pathname === '/';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // On the home page: transparent always. On other pages: subtle dark.
    const navBg = isHome
        ? (scrolled ? 'rgba(6,6,12,0.85)' : 'transparent')
        : 'rgba(6,6,12,0.95)';

    const navBorder = isHome
        ? (scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none')
        : '1px solid rgba(255,255,255,0.06)';

    const linkColor = 'rgba(255,255,255,0.60)';
    const linkHover = '#ffffff';

    const getLinkStyle = (path) => ({
        color: location.pathname === path ? '#fff' : linkColor,
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        transition: 'color 0.2s',
        cursor: 'pointer',
    });

    const publicLinks = [
        { label: 'About', to: '/about', icon: FiInfo },
        { label: 'Features', to: '/features', icon: FiStar },
        { label: 'How it works', to: '/how-it-works', icon: FiHelpCircle },
    ];

    return (
        <>
            {/* Top Navigation Bar */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: navBg,
                backdropFilter: scrolled ? 'blur(24px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
                borderBottom: navBorder,
                transition: 'all 0.3s ease',
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>

                    {/* Logo */}
                    <Link to={user ? "/dashboard" : "/"} style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#fff',
                        textDecoration: 'none',
                        letterSpacing: '-0.04em',
                    }}>
                        Learnix
                    </Link>

                    {/* Center links - Desktop Only */}
                    {!user && (
                        <div className="hidden md:flex gap-10 items-center">
                            {publicLinks.map(({ label, to }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    style={getLinkStyle(to)}
                                    onMouseEnter={e => (e.currentTarget.style.color = linkHover)}
                                    onMouseLeave={e => (e.currentTarget.style.color = location.pathname === to ? '#fff' : linkColor)}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Auth - Visible on Mobile and Desktop top bar */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="hidden md:block" style={getLinkStyle('/dashboard')}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                                    onMouseLeave={e => (e.currentTarget.style.color = location.pathname === '/dashboard' ? '#fff' : linkColor)}>
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="hidden md:block" style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.14)',
                                    color: '#fff',
                                    padding: '0.45rem 1.1rem',
                                    borderRadius: '2rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    letterSpacing: '-0.01em',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
                                    Logout
                                </button>

                                {/* Mobile Logout Icon only - Dashboard is in bottom nav */}
                                <button onClick={handleLogout} className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">
                                    <FiLogOut size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" style={getLinkStyle('/login')}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                                    onMouseLeave={e => (e.currentTarget.style.color = location.pathname === '/login' ? '#fff' : linkColor)}>
                                    Login
                                </Link>
                                <Link to="/register" style={{
                                    background: '#ffffff',
                                    color: '#06060c',
                                    textDecoration: 'none',
                                    padding: '0.45rem 1.1rem',
                                    borderRadius: '2rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s',
                                    letterSpacing: '-0.01em',
                                    display: 'inline-block',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#e5e5e5')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}>
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation Bar (App-like Tab Bar) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#06060c]/90 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
                <div className="flex justify-around items-center h-16 px-2">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="flex flex-col items-center gap-1 w-full" style={{ color: location.pathname === '/dashboard' ? '#fff' : linkColor }}>
                                <FiGrid size={20} style={{ marginBottom: '2px' }} />
                                <span className="text-[0.65rem] font-semibold tracking-wide">Dashboard</span>
                            </Link>
                        </>
                    ) : (
                        publicLinks.map(({ label, to, icon: Icon }) => (
                            <Link key={label} to={to} className="flex flex-col items-center gap-1 flex-1 py-2" style={{ color: location.pathname === to ? '#fff' : linkColor }}>
                                <Icon size={20} style={{ marginBottom: '2px' }} />
                                <span className="text-[0.65rem] font-semibold tracking-wide text-center" style={{ lineHeight: 1 }}>{label}</span>
                            </Link>
                        ))
                    )}
                </div>
            </nav>
        </>
    );
}

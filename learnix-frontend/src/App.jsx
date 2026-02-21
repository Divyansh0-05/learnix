import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/auth/PrivateRoute';


// Pages — Public
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Pages — App
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Skills from './pages/Skills';
import Matches from './pages/Matches';
import Profile from './pages/Profile';

// Hide footer on the landing page and chat pages
function Layout({ children }) {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isChat = location.pathname.startsWith('/chat');

    React.useEffect(() => {
        // Synchronous immediate scroll to top on route change
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [location.pathname]);

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <Navbar />
            <main>{children}</main>
            {!isHome && !isChat && <Footer />}
        </div>
    );
}

function App() {
    return (
        <HelmetProvider>
            <Router>

                <AuthProvider>
                    <SocketProvider>
                        <Layout>
                            <Routes>
                                {/* Public */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/features" element={<Features />} />
                                <Route path="/how-it-works" element={<HowItWorks />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />

                                {/* Protected */}
                                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                                <Route path="/profile/:id?" element={<PrivateRoute><Profile /></PrivateRoute>} />
                                <Route path="/skills" element={<PrivateRoute><Skills /></PrivateRoute>} />
                                <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
                                <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                                <Route path="/chat/:matchId" element={<PrivateRoute><Chat /></PrivateRoute>} />

                            </Routes>
                        </Layout>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#0a0a0f',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 1.25rem',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                                },
                                success: {
                                    icon: <FiCheckCircle style={{ color: '#10b981', fontSize: '1.25rem' }} />,
                                },
                                error: {
                                    icon: <FiAlertCircle style={{ color: '#ef4444', fontSize: '1.25rem' }} />,
                                }
                            }}
                        />
                    </SocketProvider>
                </AuthProvider>
            </Router>
        </HelmetProvider>
    );
}

export default App;

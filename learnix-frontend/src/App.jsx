import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// import ChatTest from './pages/ChatTest'; // Removed
import Chat from './pages/Chat'; // Real Chat Page
import {
    Register,
    Profile,
    Skills,
    Matches,
    // Chat, // Removed placeholder
    AdminDashboard,
    Users
} from './pages/Placeholders';

function App() {
    return (
        <HelmetProvider>
            <Router>
                <AuthProvider>
                    <SocketProvider>
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-grow">
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />

                                    {/* Protected Routes */}
                                    <Route path="/dashboard" element={
                                        <PrivateRoute>
                                            <Dashboard />
                                        </PrivateRoute>
                                    } />
                                    <Route path="/profile/:id?" element={
                                        <PrivateRoute>
                                            <Profile />
                                        </PrivateRoute>
                                    } />
                                    <Route path="/skills" element={
                                        <PrivateRoute>
                                            <Skills />
                                        </PrivateRoute>
                                    } />
                                    <Route path="/matches" element={
                                        <PrivateRoute>
                                            <Matches />
                                        </PrivateRoute>
                                    } />

                                    <Route path="/chat" element={
                                        <PrivateRoute>
                                            <Chat />
                                        </PrivateRoute>
                                    } />
                                    <Route path="/chat/:matchId" element={
                                        <PrivateRoute>
                                            <Chat />
                                        </PrivateRoute>
                                    } />

                                    {/* Test Routes Removed */}

                                    {/* Admin Routes */}
                                    <Route path="/admin" element={
                                        <AdminRoute>
                                            <AdminDashboard />
                                        </AdminRoute>
                                    } />
                                    <Route path="/admin/users" element={
                                        <AdminRoute>
                                            <Users />
                                        </AdminRoute>
                                    } />
                                </Routes>
                            </main>
                            <Footer />
                        </div>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                },
                            }}
                        />
                    </SocketProvider>
                </AuthProvider>
            </Router>
        </HelmetProvider>
    );
}

export default App;

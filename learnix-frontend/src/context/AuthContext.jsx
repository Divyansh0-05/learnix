import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('accessToken'));

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.data.user);
        } catch (error) {
            console.error('Failed to load user:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setToken(accessToken);
            setUser(user);

            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            let errorMsg = error.response?.data?.error;
            if (!errorMsg && error.response?.data?.errors?.length > 0) {
                errorMsg = error.response.data.errors[0].message;
            }
            return {
                success: false,
                error: errorMsg || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { accessToken, refreshToken, user } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setToken(accessToken);
            setUser(user);

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            let errorMsg = error.response?.data?.error;
            if (!errorMsg && error.response?.data?.errors?.length > 0) {
                errorMsg = error.response.data.errors[0].message;
            }
            return {
                success: false,
                error: errorMsg || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setUser(null);
            toast.success('Logged out successfully');
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            toast.success('Password reset email sent!');
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to send reset email'
            };
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            toast.success('Password reset successful!');
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to reset password'
            };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - redirect to login
                localStorage.clear();
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
            }
        }

        // Show error toast for other errors
        let errorMessage = error.response?.data?.error;
        if (!errorMessage && error.response?.data?.errors?.length > 0) {
            errorMessage = error.response.data.errors[0].message;
        }
        errorMessage = errorMessage || 'Something went wrong';
        if (error.response?.status !== 401) {
            toast.error(errorMessage, { id: errorMessage });
        }

        return Promise.reject(error);
    }
);

export default api;

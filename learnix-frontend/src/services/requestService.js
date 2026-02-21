import api from './api';

export const sendRequest = async (matchId, receiverId, message) => {
    try {
        const response = await api.post('/requests/send', {
            matchId,
            receiverId,
            message
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const acceptRequest = async (requestId) => {
    try {
        const response = await api.put(`/requests/${requestId}/accept`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const declineRequest = async (requestId, reason) => {
    try {
        const response = await api.put(`/requests/${requestId}/decline`, { reason });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const cancelRequest = async (requestId) => {
    try {
        const response = await api.delete(`/requests/${requestId}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getPendingRequests = async (type = 'received') => {
    try {
        const response = await api.get('/requests/pending', {
            params: { type }
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getRequestHistory = async (page = 1) => {
    try {
        const response = await api.get('/requests/history', {
            params: { page }
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

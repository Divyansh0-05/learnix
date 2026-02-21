import api from './api';

export const findMatches = async (params = {}) => {
    try {
        const response = await api.get('/matches/find', { params });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMyMatches = async (status = 'all', page = 1) => {
    try {
        const response = await api.get('/matches/my', {
            params: { status, page }
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMatchDetails = async (id) => {
    try {
        const response = await api.get(`/matches/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const blockMatch = async (userId, reason) => {
    try {
        const response = await api.post('/matches/block', { userId, reason });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteMatch = async (id) => {
    try {
        const response = await api.delete(`/matches/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

import api from './api';

// Get user's skills
export const getUserSkills = async (userId) => {
    try {
        const response = await api.get(`/skills/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Add a new skill
export const addSkill = async (skillData) => {
    try {
        const response = await api.post('/skills', skillData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update a skill
export const updateSkill = async (id, skillData) => {
    try {
        const response = await api.put(`/skills/${id}`, skillData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete a skill
export const deleteSkill = async (id) => {
    try {
        const response = await api.delete(`/skills/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Search skills
export const searchSkills = async (params) => {
    try {
        const response = await api.get('/skills/search', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get skill categories
export const getCategories = async () => {
    try {
        const response = await api.get('/skills/categories');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

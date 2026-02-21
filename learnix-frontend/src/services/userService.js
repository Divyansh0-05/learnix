import api from './api';

export const getUserProfile = (id) => api.get(`/users/${id}`);
export const updateProfile = (data) => api.put('/users/profile', data);
export const getUserStats = (id) => api.get(`/users/${id}/stats`);

// Block & Report
export const blockUser = (id) => api.post(`/users/${id}/block`);
export const unblockUser = (id) => api.delete(`/users/${id}/block`);
export const reportUser = (id, data) => api.post(`/users/${id}/report`, data);

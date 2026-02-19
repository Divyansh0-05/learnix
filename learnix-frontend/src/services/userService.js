import api from './api';

export const getUserProfile = (id) => api.get(`/users/${id}`);
export const updateProfile = (data) => api.put('/users/profile', data);
export const getUserStats = (id) => api.get(`/users/${id}/stats`);

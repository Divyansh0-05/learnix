import api from './api';

export const getSkills = (params) => api.get('/skills', { params });
export const addSkill = (skillData) => api.post('/skills', skillData);

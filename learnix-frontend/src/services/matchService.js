import api from './api';

export const getMatches = () => api.get('/matches');
export const getMatchDetails = (id) => api.get(`/matches/${id}`);
export const respondToMatch = (matchId, status) => api.put(`/matches/${matchId}`, { status });

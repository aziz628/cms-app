// src/services/scheduleService.js
import api from './api';

const scheduleService = {
  getSchedule: async () => {
    const response = await api.get('/admin/schedule');
    return response.data;
  },
  
  createSession: async (scheduleData) => {
    const response = await api.post('/admin/schedule', scheduleData);
    return response.data;
  },
  
  updateSession: async (id, scheduleData) => {
    const response = await api.put(`/admin/schedule/${id}`, scheduleData);
    return response.data;
  },
  
  deleteSession: async (id) => {
    const response = await api.delete(`/admin/schedule/${id}`);
    return response.data;
  }
};

export default scheduleService;
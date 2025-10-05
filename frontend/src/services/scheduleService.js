// src/services/scheduleService.js
import api from './api';

const scheduleService = {
  getSchedule: async () => {
    const response = await api.get('/admin/schedule');
    return response.data;
  },
  
  createScheduleClass: async (scheduleData) => {
    const response = await api.post('/admin/schedule', scheduleData);
    return response.data;
  },
  
  updateScheduleClass: async (id, scheduleData) => {
    const response = await api.put(`/admin/schedule/${id}`, scheduleData);
    return response.data;
  },
  
  deleteScheduleClass: async (id) => {
    const response = await api.delete(`/admin/schedule/${id}`);
    return response.data;
  }
};

export default scheduleService;
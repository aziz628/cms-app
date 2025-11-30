// src/services/scheduleService.js
import api from './api';

const scheduleService = {
  getSchedule: async () => (await api.get('/admin/schedule'))?.data,

  createSession: async (scheduleData) => (await api.post('/admin/schedule', scheduleData))?.data,

  updateSession: async (id, scheduleData) => (await api.put(`/admin/schedule/${id}`, scheduleData))?.data,

  deleteSession: async (id) => (await api.delete(`/admin/schedule/${id}`))?.data
};

export default scheduleService;
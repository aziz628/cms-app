import api from './api';

const EventService = {
  getEvents: async (page) => (await api.get(`/admin/events?page=${page}`))?.data,

  createEvent: async (eventData) => (await api.post('/admin/events', eventData))?.data,

  updateEvent: async (id, eventData) => (await api.put(`/admin/events/${id}`, eventData))?.data,

  deleteEvent: async (id) => (await api.delete(`/admin/events/${id}`))?.data
};

export default EventService;

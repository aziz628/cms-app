import api from './api';

const EventService = {
  getEvents: async () => {
    const response = await api.get('/admin/events');
    return response.data;
  },
  createEvent: async (eventData) => {
    const response = await api.post('/admin/events', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/admin/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/admin/events/${id}`);
    return response.data;
  },
};

export default EventService;

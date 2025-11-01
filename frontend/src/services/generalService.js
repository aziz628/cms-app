import api from "./api";

const generalService = {
  getGeneralInfo: async() => (await api.get('admin/general-info/'))?.data,
  updateAboutSummary: async(data) => api.put('admin/general-info/about-summary', data),
  createBusinessHour: async(data) => api.post('admin/general-info/business-hours', data),
  updateBusinessHour: async(id, data) => api.put(`admin/general-info/business-hours/${id}`, data),
  deleteBusinessHour: async(id) => api.delete(`admin/general-info/business-hours/${id}`),
};

export default generalService;

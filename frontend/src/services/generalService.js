import api from "./api";

const generalService = {
  // Fetch general info
  getGeneralInfo: async() => (await api.get('admin/general-info/'))?.data,
 
  // Update hero title
  updateHeroTitle: async(data) => api.put('admin/general-info/hero-title', data),
 
  // Update hero subtitle
  updateHeroSubtitle: async(data) => api.put('admin/general-info/hero-subtitle', data),
 
  // Update hero image
  updateHeroImage: async(data) => api.put('admin/general-info/hero-image', data),
 
  // Update about summary
  updateAboutSummary: async(data) => api.put('admin/general-info/about-summary', data),
 
  // Update about image
  updateAboutImage: async(data) => api.put('admin/general-info/about-image', data),
 
  // Create business hour
  createBusinessHour: async(data) => api.post('admin/general-info/business-hours', data),
 
  // Update business hour
  updateBusinessHour: async(id, data) => api.put(`admin/general-info/business-hours/${id}`, data),
 
  // Delete business hour
  deleteBusinessHour: async(id) => api.delete(`admin/general-info/business-hours/${id}`),
};

export default generalService;

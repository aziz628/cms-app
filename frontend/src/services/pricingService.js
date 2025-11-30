import api from "./api";

const pricingService = {
  getAllPlans: async (page) => (await api.get(`/admin/pricing?page=${page}`))?.data,
  createPlan: async (planData) => (await api.post('/admin/pricing', planData))?.data,
  updatePlan: async (planId, planData) => (await api.put(`/admin/pricing/${planId}`, planData))?.data,
  deletePlan: async (planId) => (await api.delete(`/admin/pricing/${planId}`))?.data,
  addFeature: async (planId, feature) => (await api.post(`/admin/pricing/${planId}/features`, feature))?.data,
  editFeature: async (featureId, feature) => (await api.put(`/admin/pricing/${featureId}/features`, feature))?.data,
  deleteFeature: async (featureId) => (await api.delete(`/admin/pricing/${featureId}/features`))?.data
};

export default pricingService;

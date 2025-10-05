import api from "./api";

const pricingService = {
  getAllPlans: async () => {
    const response = await api.get('/admin/pricing');
    return response.data;
  },
  createPlan: async (planData) => {
    const response = await api.post('/admin/pricing', planData);
    return response.data;
  },
  updatePlan: async (planId, planData) => {
    const response = await api.put(`/admin/pricing/${planId}`, planData);
    return response.data;
  },
  deletePlan: async (planId) => {
    const response = await api.delete(`/admin/pricing/${planId}`);
    return response.data;
  },
  addFeature: async (planId,feature) => {
     const response = await api.post(`/admin/pricing/${planId}/features`,feature);
    return response.data;
  }
  ,
  editFeature:async (featureId,feature) => {
     const response = await api.put(`/admin/pricing/${featureId}/features`,feature);
    return response.data;
  },
  deleteFeature: async (featureId) => {
    await api.delete(`/admin/pricing/${featureId}/features`);
  }
};

export default pricingService;

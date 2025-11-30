import api from "./api";

const transformationService = {
  getAllTransformations: async (page) => (await api.get(`/admin/transformation?page=${page}`))?.data,
  createTransformation: async (data) => (await api.post("/admin/transformation", data))?.data,
  updateTransformation: async (id, data) => (await api.put(`/admin/transformation/${id}`, data))?.data,
  deleteTransformation: async (id) => (await api.delete(`/admin/transformation/${id}`))?.data,
};

export default transformationService;

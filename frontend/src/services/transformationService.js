import api from "./api";

const transformationService = {
  createTransformation: async (data) => (await api.post("/admin/transformation", data))?.data,
  updateTransformation: async (id, data) => (await api.put(`/admin/transformation/${id}`, data))?.data,
  deleteTransformation: async (id) => (await api.delete(`/admin/transformation/${id}`))?.data,
  getAllTransformations: async () => (await api.get("/admin/transformation"))?.data,
};

export default transformationService;

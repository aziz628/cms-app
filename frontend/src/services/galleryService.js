import api from './api';

const galleryService = {
  getGalleryItems : async () => (await api.get("/admin/gallery")).data
  ,createCategory : async (data) => (await api.post("/admin/gallery/category", data)).data
  ,updateCategory : async (categoryId, data) => (await api.put(`/admin/gallery/category/${categoryId}`, data)).data
  ,deleteCategory : async (categoryId) => (await api.delete(`/admin/gallery/category/${categoryId}`)).data
  ,createImage : async (data,category_id) => (await api.post(`/admin/gallery/${category_id}/image`, data)).data
  ,updateImage : async (imageId, data,category_id) => (await api.put(`/admin/gallery/${category_id}/image/${imageId}`, data)).data
  ,deleteImage : async (imageId,category_id) => (await api.delete(`/admin/gallery/${category_id}/image/${imageId}`)).data
}
export default galleryService;
import api from "./api";

const contactService = {
  getContactInfo: async() => (await api.get("/admin/contact"))?.data,
  addSocialMediaLink: async(data) => api.post("/admin/contact/social-media", data),
  updateSocialMediaLink: async(id, data) => api.put(`/admin/contact/social-media/${id}`, data),
  deleteSocialMediaLink: async(id) => api.delete(`/admin/contact/social-media/${id}`),
  updateLocation: async(data) => api.put("/admin/contact/address", data),
  updatePhoneNumber: async(data) => api.put("/admin/contact/phone_number", data),
  updateEmail: async(data) => api.put("/admin/contact/email", data),
}
export default contactService;
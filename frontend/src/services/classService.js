import api from './api';

const ClassService = {
    getClasses: async (page) => {
        const response = await api.get(`/admin/classes?page=${page}`);
        return response.data;
    },
    createClass: async (newClass) => {
        const response = await api.post("/admin/classes", newClass,{
        headers: {
        'Content-Type': 'multipart/form-data'
             }
        });

        return response.data;
    },
    updateClass: async (id, updatedClass) => {
        const response = await api.put(`/admin/classes/${id}`, updatedClass);
        return response.data;
    },
    deleteClass: async (id) => {
        const response = await api.delete(`/admin/classes/${id}`);
        return response.data;
    }
};
export default ClassService;

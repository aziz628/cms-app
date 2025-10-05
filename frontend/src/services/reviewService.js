import api from "./api";

const reviewService = {
    getReviews: async () => {
        const response = await api.get("/admin/review");
        return response.data;
    },
    createReview: async (newReview) => {
        console.log('Creating Review with data:', newReview);
        const response = await api.post("/admin/review", newReview,{
        headers: {
        'Content-Type': 'multipart/form-data'
             }
        });
        return response.data;
    },
    updateReview: async (id, updatedReview) => {
        const response = await api.put(`/admin/review/${id}`, updatedReview);
        return response.data;
    },
    deleteReview: async (id) => {
        const response = await api.delete(`/admin/review/${id}`);
        return response.data;
    }
};
export default reviewService;

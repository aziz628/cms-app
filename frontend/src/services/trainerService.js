import api from './api';
const TrainerService={
    getTrainers: async (page) => (await api.get(`/admin/trainers?page=${page}`))?.data,
    createTrainer: async (trainerData) => (await api.post("/admin/trainers", trainerData))?.data,
    updateTrainer: async (trainerId, trainerData) => (await api.put(`/admin/trainers/${trainerId}`, trainerData))?.data,
    deleteTrainer: async (trainerId) => (await api.delete(`/admin/trainers/${trainerId}`))?.data
}
export default TrainerService
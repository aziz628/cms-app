import api from './api';

const getTrainers = async () => {
        const response = await api.get("/admin/trainers");
        return response.data;    
}   
const createTrainer = async (trainerData) => {
    const response = await api.post("/admin/trainers", trainerData);
    return response.data;
}
const updateTrainer = async (trainerId, trainerData) => {
    const response = await api.put(`/admin/trainers/${trainerId}`, trainerData);
    return response.data;
}
const deleteTrainer = async (trainerId) => {
    const response = await api.delete(`/admin/trainers/${trainerId}`);
    return response.data;
}
export default { getTrainers, createTrainer, updateTrainer, deleteTrainer }
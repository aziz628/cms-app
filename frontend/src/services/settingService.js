import api from "./api";


const settingService = {
    updateUsername: async (newUsername) => {
        const response = await api.post('/auth/username_update', { new_username: newUsername });
        return response.data;
    },
    updatePassword: async (newPassword)=>{
        const response = await api.post('/auth/password_update', { new_password: newPassword });
        return response.data;
    }

}

export default settingService;
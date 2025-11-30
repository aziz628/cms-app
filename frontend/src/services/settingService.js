import api from "./api";


const settingService = {
    updateUsername: async (newUsername) => await api.post('/auth/username_update', { new_username: newUsername }),
    updatePassword: async (newPassword) => await api.post('/auth/password_update', { new_password: newPassword })
}

export default settingService;
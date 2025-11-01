import api from "./api";
const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    
    return response.data;
  },

  logout: async () => {
    console.log("Logout ...");
    const response = await api.post("/auth/logout");
    if (response.status === 200) {
      // Dispatch unauthorized event to handle global logout
    window.dispatchEvent(new Event('unauthorized'));
  }
    return response.data;
  },
  updatePassword: async (passwordData) => {
    const response = await api.post("/auth/update-password", passwordData);
    return response.data;
  },
  updateUsername: async (usernameData) => {
    const response = await api.post("/auth/update-username", usernameData);
    return response.data;
  }
};

export default authService;

import api from "./api";

const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  logout: async () => {
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
  },
  verifySession: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  }
};

export default authService;

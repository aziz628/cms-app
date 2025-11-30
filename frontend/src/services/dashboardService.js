import api from "./api";

const dashboardService = {
    // Fetch dashboard data with pagination
    getDashboardData: async (page) => (await api.get(`/admin/dashboard?page=${page}`)).data
};

export default dashboardService;

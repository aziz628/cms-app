import api from "./api";

const dashboardService = {
    getDashboardData: async (page) => (await api.get(`/admin/dashboard?page=${page}`)).data
};

export default dashboardService;

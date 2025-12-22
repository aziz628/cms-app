const get_cors_origins = () => {
    const env = process.env.NODE_ENV || 'development';

    // Development origins
    if (env === 'development') {
        const CLIENT_PORT=process.env.CLIENT_PORT || 5173;
        const API_PORT=process.env.API_PORT || 3000;
        return [
            // send requests to frontend dev proxy server
            `http://localhost:${CLIENT_PORT}`,
            `http://127.0.0.1:${CLIENT_PORT}`,

            // directly to api server
            `http://localhost:${API_PORT}`,
            `http://127.0.0.1:${API_PORT}`,

            // docker
            `http://frontend:${API_PORT}`, // vite proxy send requests to api server container
            // local network testing
            `http://192.168.1.12:${API_PORT}`, // local network IP for testing
        ];
        // if api port is 3000
    }

    // Production origins
   if (env === 'production') {
    // read from environment variable CORS_ORIGINS, comma separated
    const origins = process.env.CORS_ORIGINS?.split(',')?.map(o => o.trim()) || [];
   
    // throw an error if no origins are set
    if (origins.length === 0) {
        throw new Error('CORS_ORIGINS environment variable is not set or empty in production mode');
    }
    return origins;
  }
    // Default fallback for testing or other environments
    return [];
}

 const cors_config = {
  origin: get_cors_origins(),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
export default cors_config;
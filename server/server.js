import http from 'http';
import app from './app.js';
import { initialize_storage_state } from './services/upload_storage_state_service.js';

const server = http.createServer(app);

// Initialize the upload storage state
initialize_storage_state();

// Set the port to the environment variable PORT or default to 3000
const API_PORT = process.env.API_PORT || 3000;

// Start the server and listen on the specified port and put all interfaces as 0.0.0.0
server.listen(API_PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${API_PORT}`);
});
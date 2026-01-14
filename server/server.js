import http from 'http';
import app from './app.js';
import { initialize_storage_state } from './services/upload_storage_state_service.js';
import { init_session_store } from './services/session_store.js';

const server = http.createServer(app);

// Initialize the upload storage and session state
await initialize_storage_state();
await init_session_store();

// Set the port to the environment variable PORT or default to 3000
const API_PORT = process.env.API_PORT || 3000;

// Start the server and listen on the specified port and put all interfaces as 0.0.0.0
server.listen(API_PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${API_PORT}`);
});


const gracefulShutdown = () => {
    console.log('\nReceived kill signal, shutting down gracefully...');
    
    // Stop accepting new requests
    server.close(async () => {
        console.log('Closed out remaining connections.');
        
        try {
            // Exit process
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });

    // If connections don't close in 10 seconds, force shutdown
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown); // Sent by Docker
process.on('SIGINT', gracefulShutdown);  // Sent by Ctrl+C (for local dev)
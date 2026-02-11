import http from 'http';
import app from './app.js';
import { initialize_storage_state } from './services/upload_storage_state_service.js';
import { init_session_store } from './services/session_store.js';

import { initBackupService, stopBackupService, triggerManualBackup } from './services/backup_service.js';

const server = http.createServer(app);

// Initialize the upload storage and session state
await initialize_storage_state();
await init_session_store();

// Initialize DB Backup Service
initBackupService();

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
            // Stop the cron job first
            stopBackupService();

            // Perform one final backup before dying
            await triggerManualBackup();

            // Close DB only AFTER backup is done
            // Assuming your db is imported from db_connection.js, wait, server.js doesn't import db directly?
            // Actually backup service imports db. We should close it here if possible or let process exit handle it.
            // But good practice is explicit. Let's assume process exit is enough for now as db.close isn't exported in server.js context easily without import

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
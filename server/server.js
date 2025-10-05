//import dotenv from 'dotenv/config'; // Load and exec  config function from dotenv
// moved dotenv import to app.js for testing purposes
import http from 'http';
import app from './app.js';


const server = http.createServer(app);

// Set the port to the environment variable PORT or default to 3000
const PORT = process.env.PORT ;

// Start the server and listen on the specified port and put all interfaces as 0.0.0.0
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
import 'dotenv/config';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

if (!process.env.CLIENT_PORT) {
  throw new Error('Missing CLIENT_PORT environment variable');
}
if (!process.env.API_PORT) {
  throw new Error('Missing API_PORT environment variable');
}

// read port and proxy target from environment variables
const client_port = process.env.CLIENT_PORT || '5173';
const api_port = process.env.API_PORT || '3001';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/cms/',  // add the prefix /cms/ to all asset urls
   server: {
    port: client_port,
    // browser prevent sending api requests from vite server to api server because of samesite cookies
    // so we keep the vite server as current origin to receive requests and use it as proxy to forward them to api server
    proxy:  {
      '/api': {
        target: `http://127.0.0.1:${api_port}`, // Use IPv4 explicitly instead of localhost
        changeOrigin: true
      },
      '/uploads': {
        target: `http://127.0.0.1:${api_port}`, // Use IPv4 explicitly instead of localhost
        changeOrigin: true
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    proxy:  {
      '/api': {
        target: 'http://127.0.0.1:3001', // Use IPv4 explicitly instead of localhost
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001', // Use IPv4 explicitly instead of localhost
        changeOrigin: true
      }
    }
  }
})

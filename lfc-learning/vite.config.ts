import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  },
  // Add these for production build
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps for smaller build
  },
  // Use environment variables
  define: {
    'process.env': {
      // Only expose safe public variables
      VITE_API_URL: process.env.VITE_API_URL,
    }
  }
})
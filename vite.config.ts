import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/screening': { target: 'http://localhost:8001', changeOrigin: true },
      '/api/insider': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/financials': { target: 'http://localhost:8002', changeOrigin: true },
      '/api/valuation': { target: 'http://localhost:8003', changeOrigin: true },
    },
  },
})

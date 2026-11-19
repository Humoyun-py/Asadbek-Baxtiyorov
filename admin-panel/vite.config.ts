import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The panel is served under /admin (dev: http://localhost:5174/admin/)
export default defineConfig({
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
})

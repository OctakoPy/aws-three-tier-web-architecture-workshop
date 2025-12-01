import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'build',
    sourcemap: false
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})
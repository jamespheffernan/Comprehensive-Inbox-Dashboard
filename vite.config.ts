import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: process.env.ELECTRON ? './' : '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5176,
    strictPort: false, // Allow fallback to another port if 5176 is taken
  },
})

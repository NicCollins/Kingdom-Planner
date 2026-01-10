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
  // For GitHub Pages deployment later
  base: './',
  build: {
    outDir: 'dist',
    // Generate sourcemaps for debugging
    sourcemap: true,
  },
  // Optimize for development
  server: {
    port: 3000,
    open: true, // Auto-open browser
  },
})
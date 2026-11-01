import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import packageAliases from './.figma/make/migrated-package-aliases.json'

export default defineConfig({
  // Relative base so Electron can load dist/index.html without a web server
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      ...Object.entries(packageAliases as Record<string, string>).map(([find, replacement]) => ({
        find,
        replacement,
      })),
    ],
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

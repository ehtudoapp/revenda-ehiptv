import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build:{
    outDir: '../backend/pb_public',
    emptyOutDir: true
  }
  ,server: {
  port: 5173,
  strictPort: true,
    proxy: {
      // proxia /profile para o pocketbase local na porta 8090
      '/profile': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {  
    port: 5173,  // ここを追加
    strictPort: true // ここを追加
  }
})

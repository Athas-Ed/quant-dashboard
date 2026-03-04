import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  // GitHub Pages 使用仓库子路径；离线打包使用相对路径
  base: mode === 'offline' ? './' : '/quant-dashboard/',
}))
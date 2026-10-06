import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative base so the build works on any GitHub Pages path
// (username.github.io or username.github.io/repo-name).
export default defineConfig({
  base: './',
  plugins: [vue()],
})

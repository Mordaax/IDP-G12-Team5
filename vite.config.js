import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { isolateGuideCss } from './scripts/isolate-guide-css.js'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  css: { postcss: { plugins: [isolateGuideCss()] } },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})

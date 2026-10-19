import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { isolateGuideCss } from './scripts/isolate-guide-css.js'

export default defineConfig({
  plugins: [react({ include: /\.jsx$/ }), tailwindcss()],
  // keeps the team style guide's Tailwind output inside .style-guide (from the feat/style-guide branch)
  css: { postcss: { plugins: [isolateGuideCss()] } },
  // .env: ONEMAP_API (the OneMap token for the Events map) is readable as import.meta.env.ONEMAP_API
  envPrefix: ['VITE_', 'ONEMAP_'],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})

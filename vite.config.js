import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { isolateGuideCss } from './scripts/isolate-guide-css.js'

// Two apps, one site:
//   index.html  → React (src/main.jsx): Discover, sign up, onboarding, artist, forum, notifications …
//   events.html → Vue   (src/events.js): everything under /events
// This plugin sends /events/* to events.html while developing (`npm run dev` / `npm run preview`).
// When hosting the built site, add the same rewrite: /events/* → /events.html, everything else → /index.html.
function eventsPages() {
  const rewrite = (req, _res, next) => {
    const path = req.url.split('?')[0]
    if ((path === '/events' || path.startsWith('/events/')) && !path.includes('.')) req.url = '/events.html'
    next()
  }
  return {
    name: 'events-pages',
    configureServer: (server) => { server.middlewares.use(rewrite) },
    configurePreviewServer: (server) => { server.middlewares.use(rewrite) },
  }
}

export default defineConfig({
  plugins: [eventsPages(), react({ include: /\.jsx$/ }), vue(), tailwindcss()],
  // keeps the team style guide's Tailwind output inside .style-guide (from the feat/style-guide branch)
  css: { postcss: { plugins: [isolateGuideCss()] } },
  // .env: ONEMAP_API (the OneMap token for the Events map) is readable as import.meta.env.ONEMAP_API
  envPrefix: ['VITE_', 'ONEMAP_'],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        events: fileURLToPath(new URL('./events.html', import.meta.url)),
      },
    },
  },
})

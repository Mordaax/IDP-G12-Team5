// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// Static site: `npm run build` writes plain HTML/CSS/JS to ./dist
export default defineConfig({
  output: 'static',
  integrations: [
    react(), // React islands, used later for the 3D pieces
    vue({ appEntrypoint: '/src/events-app/_app.js' }), // the Events screens are a Vue + Bootstrap app
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src/events-app', import.meta.url)) } },
  },
});

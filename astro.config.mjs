// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Static site: `npm run build` writes plain HTML/CSS/JS to ./dist
export default defineConfig({
  output: 'static',
  integrations: [react()], // React islands, used later for the 3D pieces
  vite: { plugins: [tailwindcss()] },
});

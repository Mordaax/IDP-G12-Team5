# LittleRedMusic — Hi Fi screens

A clickable prototype of **LittleRedMusic**, a music discovery app for the Singapore scene:
artists shown as a web of dots you can zoom into by genre, artist and event pages, and a
per-event forum.

The 22 screens in `src/pages/` are coded 1:1 from the "8 Hi Fi Screens" page of the team's
Figma file. Each one is a fixed 1440 × 900 canvas with absolutely positioned elements, so a
screen renders the same as the frame it came from rather than reflowing like a normal web page.
There is no backend — every screen is static markup and the links between them stand in for
the prototype's flows.

## Getting started

```bash
npm install
npm run dev        # http://localhost:4321
```

`/` is the screen directory: one link per Figma frame, which is the quickest way to click
through the build or to hand testers a specific screen.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run fetch-images` | Pull the real photos from Figma (see below) |

## Images

The screens ship with neutral SVG placeholders in `public/assets/img/placeholder/` so the repo
stays small and carries no licensed artwork. To swap in the real photos:

1. In Figma: **Settings → Security → Personal access tokens → Generate new token**, scope
   *File content: read-only*.
2. Run the fetch with the token in the environment:

   ```powershell
   $env:FIGMA_TOKEN = "your-token"; npm run fetch-images
   ```

   ```bash
   FIGMA_TOKEN=your-token npm run fetch-images
   ```

It downloads each image into `public/assets/img/figma/` and rewrites `src/data/images.ts` to
point at the downloads. Any image that has since been deleted from the Figma file keeps its
placeholder. Icons in `public/assets/icons/` are checked in as SVG and need no fetching.

## Layout

```
src/
  pages/        One .astro file per screen — the routes in src/data/routes.ts
  components/   Screen pieces, grouped by area (discover, events, forum, artist, …)
  layouts/      Screen.astro — the 1440 × 900 frame, fonts and <head>
  data/         Dot positions, genres, image paths and the route table
  styles/       global.css — Tailwind import plus the design tokens from Figma
public/assets/  Icons exported from Figma, placeholder art, brand mark
scripts/        fetch-images, and bundle-preview.py (one-file build of the prototype)
```

`src/data/routes.ts` is the map between routes and Figma frames: each entry carries the frame
name and node id, plus a `built` flag that drives the counter and the greyed-out rows on the
directory page.

Colours, fonts and genre swatches live as `@theme` tokens at the top of `src/styles/global.css`
(`text-ink`, `bg-brand`, `font-geist`, …), so a value from Figma is changed in one place. Nav
links use SF Pro where it exists and fall back to Inter elsewhere.

The point coordinates in `src/data/discoverGraph.ts` and `src/data/graphs/` are exported
straight out of Figma and packed into strings — they're data, not something to hand-edit.

## Notes

- Tech: [Astro](https://astro.build) 7 (static output) + Tailwind CSS 4. React and
  `@react-three/fiber` are installed for 3D work on the discover graph but nothing uses them yet.
- Screens are built for a desktop viewport. Below 1440px the canvas scrolls sideways instead
  of adapting.
- `scripts/bundle-preview.py` inlines a `dist/` build into a single self-contained HTML file
  (fonts, images and all) for sharing the prototype as one file. It runs after `npm run build`
  and currently writes to a hardcoded output path near the bottom of the script — change that
  line to a local path before running it.

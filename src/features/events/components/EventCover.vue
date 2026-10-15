<script setup>
import { computed } from 'vue'

// Illustrated concert "photo" placeholder (stage lights + crowd silhouette).
// Swap for a real <img> when events get cover images; the slot lets cards
// overlay badges either way.
const props = defineProps({
  palette: { type: String, default: 'purple' },
  seed: { type: String, default: '' },
  label: { type: String, default: '' },
})

const palettes = {
  purple: ['#1b0a3a', '#7b2a9e', '#ff4f7b', '#ffb36b'],
  blue: ['#04122e', '#0b3a8c', '#2f8bff', '#8fd3ff'],
  orange: ['#2a0a05', '#a3290f', '#ff7a2a', '#ffd27a'],
  teal: ['#031d2a', '#0a5c6e', '#16c2b0', '#b7f5d8'],
}

const colors = computed(() => palettes[props.palette] || palettes.purple)

// Deterministic pseudo-random so each event has a stable crowd.
function rng(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

// One seamless-enough tile of crowd silhouette, repeated horizontally so the
// heads keep a constant size whatever the cover's width is.
const crowdTile = computed(() => {
  const r = rng(props.seed || props.palette)
  let shapes = ''
  for (let i = 0; i < 18; i++) {
    const x = (i / 18) * 300 + r() * 10
    const y = 44 + r() * 18
    const rad = 9 + r() * 5
    if (r() > 0.7) {
      const dx = (r() - 0.5) * 14
      const h = 20 + r() * 18
      shapes += `<rect x="${(x + dx - 1.5).toFixed(1)}" y="${(y - h).toFixed(1)}" width="3" height="${h.toFixed(1)}" rx="1.5"/>`
    }
    shapes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}"/>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" width="300" height="80"><g fill="#07070f">${shapes}<rect x="0" y="62" width="300" height="20"/></g></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})

const style = computed(() => {
  const [c0, c1, c2, c3] = colors.value
  return {
    background: [
      `radial-gradient(ellipse 60% 55% at 28% 18%, ${c2}cc, transparent 70%)`,
      `radial-gradient(ellipse 50% 50% at 78% 22%, ${c3}99, transparent 70%)`,
      `linear-gradient(180deg, ${c1} 0%, ${c0} 100%)`,
    ].join(','),
  }
})
</script>

<template>
  <div class="event-cover" :style="style">
    <span class="event-cover__beam event-cover__beam--a" />
    <span class="event-cover__beam event-cover__beam--b" />
    <span v-if="label" class="event-cover__label">{{ label }}</span>
    <div class="event-cover__crowd" :style="{ backgroundImage: crowdTile }" aria-hidden="true"></div>
    <div class="event-cover__content"><slot /></div>
  </div>
</template>

<style scoped>
.event-cover {
  position: relative;
  overflow: hidden;
  border-radius: inherit;
  isolation: isolate;
}
.event-cover__beam {
  position: absolute;
  top: -10%;
  width: 18%;
  height: 120%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
  filter: blur(6px);
  mix-blend-mode: screen;
  opacity: 0.55;
  z-index: -1;
}
.event-cover__beam--a {
  left: 18%;
  transform: rotate(18deg);
}
.event-cover__beam--b {
  left: 62%;
  transform: rotate(-20deg);
}
.event-cover__label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding-bottom: 14%;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45);
}
.event-cover__crowd {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: min(46%, var(--crowd-max, 96px));
  background-repeat: repeat-x;
  background-position: left bottom;
  background-size: auto 100%;
}
.event-cover__content {
  position: absolute;
  inset: 0;
}
</style>

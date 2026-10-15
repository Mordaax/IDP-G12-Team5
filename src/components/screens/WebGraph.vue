<script setup>
// Figma: "Discover Reference" graph layer — shared-audience links, 178 artist dots,
// genre cluster labels and the two artist photo dots.
import { ARTIST_DOTS, GENRE_BY_KEY, LINKS_ORIGIN, ROUTES } from '@/data'

const LABELS = [
  { key: 'indie', x: 362, y: 297 },
  { key: 'pop', x: 410, y: 636 },
  { key: 'mandopop', x: 645, y: 246 },
  { key: 'hiphop', x: 778, y: 525 },
  { key: 'electronic', x: 509, y: 96, href: ROUTES.discoverElectronic },
  { key: 'ethnic', x: 282, y: 552 },
]
const cls = 'absolute whitespace-nowrap text-[12px] leading-[1.4] font-semibold'
</script>

<template>
  <!-- shared-audience lines -->
  <img src="/assets/icons/graph-links.svg" alt="" width="792" height="750" class="pointer-events-none absolute max-w-none" :style="`left:${LINKS_ORIGIN.x}px; top:${LINKS_ORIGIN.y}px`" />

  <!-- artist dots -->
  <svg class="pointer-events-none absolute left-0 top-0" width="1440" height="828" aria-hidden="true">
    <circle v-for="(d, i) in ARTIST_DOTS" :key="i" :cx="d.x + d.d / 2" :cy="d.y + d.d / 2" :r="d.d / 2" :fill="GENRE_BY_KEY[d.genre].dot" />
    <!-- highlighted Pop Music dot (Figma "Ellipse" 1440:376) -->
    <circle :cx="514.75 + 8" :cy="371.66 + 8" r="8" fill="#8b5cf6" />
  </svg>

  <!-- genre cluster labels -->
  <template v-for="l in LABELS" :key="l.key">
    <a v-if="l.href" :href="l.href" :class="cls" :style="`left:${l.x}px; top:${l.y}px; color:${GENRE_BY_KEY[l.key].label}`">{{ GENRE_BY_KEY[l.key].name }}</a>
    <p v-else :class="`${cls} m-0`" :style="`left:${l.x}px; top:${l.y}px; color:${GENRE_BY_KEY[l.key].label}`">{{ GENRE_BY_KEY[l.key].name }}</p>
  </template>

  <!-- artist photo dot, top of the Electronic cluster -->
  <img src="/assets/img/avatar-electronic.png" alt="" width="37" height="37" class="absolute left-[453px] top-[23px] size-[37px] max-w-none" />
</template>

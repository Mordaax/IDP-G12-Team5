<script setup>
// Generic graph renderer for the Discover screens: link layer (SVG), dots, labels, photo dots.
import { computed } from 'vue'

const props = defineProps({
  dots: { type: String, required: true },       // "x,y,d,hex[,s<hex>/<w>] ..."
  links: { type: Array, required: true },       // { src, x, y, w, h }
  labels: { type: Array, required: true },      // [x, y, size, weight, colour, text]
  photos: { type: Array, default: () => [] },   // [x, y, size, src]
  linkHrefs: { type: Object, default: () => ({}) }, // label text → href
})
const parsed = computed(() => props.dots.split(' ').map((s) => {
  const [x, y, d, fill, stroke] = s.split(',')
  const st = stroke?.startsWith('s') ? stroke.slice(1).split('/') : null
  return { x: +x, y: +y, d: +d, fill: fill === '-' ? 'none' : '#' + fill, stroke: st ? '#' + st[0] : undefined, sw: st ? st[1] : undefined, dash: st && st[2] ? st[2].replace('-', ' ') : undefined }
}))
const labelStyle = ([x, y, size, weight, color]) => `left:${x}px; top:${y}px; font-size:${size}px; font-weight:${weight}; color:${color}`
</script>

<template>
  <img v-for="(l, i) in links" :key="'l' + i" :src="l.src" alt="" :width="l.w" :height="l.h" class="pointer-events-none absolute max-w-none" :style="`left:${l.x}px; top:${l.y}px`" />
  <svg class="pointer-events-none absolute left-0 top-0 overflow-visible" width="1440" height="828" aria-hidden="true">
    <circle v-for="(d, i) in parsed" :key="i" :cx="d.x + d.d / 2" :cy="d.y + d.d / 2" :r="d.d / 2" :fill="d.fill" :stroke="d.stroke" :stroke-width="d.sw" :stroke-dasharray="d.dash" />
  </svg>
  <template v-for="(l, i) in labels" :key="'t' + i">
    <a v-if="linkHrefs[l[5]]" :href="linkHrefs[l[5]]" class="absolute whitespace-nowrap leading-[1.4]" :style="labelStyle(l)">{{ l[5] }}</a>
    <p v-else class="absolute m-0 whitespace-nowrap leading-[1.4]" :style="labelStyle(l)">{{ l[5] }}</p>
  </template>
  <img v-for="(p, i) in photos" :key="'p' + i" :src="p[3]" alt="" :width="p[2]" :height="p[2]" class="absolute max-w-none rounded-full" :style="`left:${p[0]}px; top:${p[1]}px; width:${p[2]}px; height:${p[2]}px`" />
</template>

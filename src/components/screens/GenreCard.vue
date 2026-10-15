<script setup>
// Figma: "card / Pick your genres" (520 × 340).
//   chipStyle "dark" → selected chips are black (📸 6)
//   chipStyle "bold" → selected chips stay white with bold text (manual taste profile)
import { GENRE_BY_KEY } from '@/data'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  title: { type: String, required: true },
  selected: { type: Array, required: true },
  chipStyle: { type: String, required: true },
  summary: { type: String, required: true },
  dotOverrides: { type: Object, default: () => ({}) },
})

const MAIN = [
  { key: 'indie', x: 23, y: 75 }, { key: 'pop', x: 263, y: 75 },
  { key: 'mandopop', x: 23, y: 113 }, { key: 'electronic', x: 263, y: 113 },
  { key: 'hiphop', x: 23, y: 151 }, { key: 'ethnic', x: 263, y: 151 },
]
const SUB = [
  { name: 'House', genre: 'electronic', x: 23, y: 221, w: 73 },
  { name: 'Techno', genre: 'electronic', x: 104, y: 221, w: 78 },
  { name: 'Synthwave', genre: 'electronic', x: 190, y: 221, w: 101 },
  { name: 'Drum & Bass', genre: 'electronic', x: 299, y: 221, w: 109 },
  { name: 'Alt-Pop', genre: 'pop', x: 416, y: 221, w: 79 },
  { name: 'Lo-fi Hip-Hop', genre: 'hiphop', x: 23, y: 253, w: 114 },
  { name: 'Post-Rock', genre: 'indie', x: 145, y: 253, w: 95 },
  { name: 'Gamelan', genre: 'ethnic', x: 248, y: 253, w: 86 },
  { name: 'Mandopop Ballads', genre: 'mandopop', x: 342, y: 253, w: 141 },
]
const dot = (name, g) => props.dotOverrides[name] ?? GENRE_BY_KEY[g].dot
const on = (name) => props.selected.includes(name)
const dark = (name) => on(name) && props.chipStyle === 'dark'
</script>

<template>
  <div class="absolute h-[340px] w-[520px] overflow-clip rounded-[12px] border border-[#ddd] bg-white" :style="`left:${x}px; top:${y}px`">
    <p class="absolute left-[23px] top-[23px] m-0 whitespace-nowrap text-[16px] leading-normal font-semibold text-[#1a1a1a]">{{ title }}</p>
    <p class="absolute left-[23px] top-[47px] m-0 whitespace-nowrap text-[12px] leading-normal text-[#888]">These are the clusters on your Discover map.</p>

    <button v-for="c in MAIN" :key="c.key" type="button" :aria-pressed="on(GENRE_BY_KEY[c.key].name) ? 'true' : 'false'" :class="`absolute block h-[34px] w-[232px] rounded-[17px] text-left ${dark(GENRE_BY_KEY[c.key].name) ? 'bg-[#1a1a1a]' : 'border border-[#ddd] bg-white'}`" :style="`left:${c.x}px; top:${c.y}px`">
      <span :class="`absolute size-[8px] rounded-full ${dark(GENRE_BY_KEY[c.key].name) ? 'left-[14px] top-[13px]' : 'left-[13px] top-[12px]'}`" :style="`background:${dot(GENRE_BY_KEY[c.key].name, c.key)}`"></span>
      <span :class="`absolute whitespace-nowrap text-[12px] leading-normal ${dark(GENRE_BY_KEY[c.key].name) ? 'left-[30px] top-[10px] font-semibold text-white' : `left-[29px] top-[9px] text-[#1a1a1a] ${on(GENRE_BY_KEY[c.key].name) ? 'font-semibold' : ''}`}`">{{ GENRE_BY_KEY[c.key].name }}</span>
    </button>

    <p class="absolute left-[23px] top-[197px] m-0 whitespace-nowrap text-[12px] leading-normal font-semibold text-[#888]">Narrow it down — optional</p>
    <button v-for="c in SUB" :key="c.name" type="button" :aria-pressed="on(c.name) ? 'true' : 'false'" :class="`absolute block h-[26px] rounded-[13px] text-left ${dark(c.name) ? 'bg-[#1a1a1a]' : 'border border-[#ddd] bg-white'}`" :style="`left:${c.x}px; top:${c.y}px; width:${c.w}px`">
      <span :class="`absolute size-[6px] rounded-full ${dark(c.name) ? 'left-[12px] top-[10px]' : 'left-[11px] top-[9px]'}`" :style="`background:${dot(c.name, c.genre)}`"></span>
      <span :class="`absolute whitespace-nowrap text-[12px] leading-normal ${dark(c.name) ? 'left-[24px] top-[6px] font-semibold text-white' : `left-[23px] top-[5px] text-[#1a1a1a] ${on(c.name) ? 'font-semibold' : ''}`}`">{{ c.name }}</span>
    </button>

    <p class="absolute left-[23px] top-[299px] m-0 whitespace-nowrap text-[12px] leading-normal text-[#666]">{{ summary }}</p>
  </div>
</template>

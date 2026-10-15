<script setup>
// Figma: "panel / Recommended for you" (288 × 560).
import { computed } from 'vue'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  nowPlayingHref: { type: String, default: undefined },
  closeHref: { type: String, default: undefined },
  metalDot: { type: String, default: '#64748b' },
})
const ROWS = computed(() => [
  { title: 'Low Tide (Now playing)', sub: 'FallingIslands · synthwave', dot: '#0fb3a1', playing: true },
  { title: 'Midnight Transit', sub: 'Evanturetime · EDM', dot: '#0fb3a1' },
  { title: 'Slow Burn', sub: 'Lullaboy · alt-pop', dot: '#f5a524' },
  { title: 'Kampong Bass', sub: 'Fauxe · EDM', dot: '#0fb3a1' },
  { title: 'Coastline', sub: 'Marian Carmel · alt-pop', dot: '#f5a524' },
  { title: 'Hollow Bark', sub: 'Wormrot · metal', dot: props.metalDot },
])
</script>

<template>
  <aside class="absolute h-[560px] w-[288px] rounded-[12px] bg-white shadow-[0px_6px_20px_0px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-line" :style="`left:${x}px; top:${y}px`">
    <h2 class="absolute left-[20px] top-[20px] m-0 whitespace-nowrap text-[16px] leading-normal font-semibold text-[#1a1a1a]">Recommended for you</h2>
    <p class="absolute left-[20px] top-[44px] m-0 whitespace-nowrap text-[11px] leading-normal text-[#888]">From your taste profile · 78% EDM</p>
    <a :href="closeHref" aria-label="Close" class="absolute left-[246px] top-[18px] block size-[24px] rounded-[12px] ring-1 ring-inset ring-line">
      <span class="absolute left-[7px] top-[4px] text-[14px] leading-normal text-[#666]">×</span>
    </a>
    <template v-for="(r, i) in ROWS" :key="r.title">
      <component :is="r.playing && nowPlayingHref ? 'a' : 'div'" :href="r.playing ? nowPlayingHref : undefined" class="absolute left-[20px] block h-[44px] w-[248px]" :style="`top:${76 + i * 68}px`">
        <span class="absolute left-0 top-0 size-[44px] rounded-[8px] bg-[#ddd]">
          <svg v-if="r.playing" class="absolute left-[11px] top-[8px]" width="24" height="28" viewBox="0 0 24 28" aria-hidden="true"><path d="M0 0L24 14L0 28Z" fill="#000" /></svg>
        </span>
        <span class="absolute left-[56px] top-[4px] whitespace-nowrap text-[13px] leading-normal font-semibold text-[#1a1a1a]">{{ r.title }}</span>
        <span class="absolute left-[56px] top-[22px] whitespace-nowrap text-[11px] leading-normal text-[#888]">{{ r.sub }}</span>
        <span class="absolute left-[234px] top-[18px] size-[8px] rounded-full" :style="`background:${r.dot}`"></span>
      </component>
      <div class="absolute left-[20px] h-px w-[248px] bg-[#eee]" :style="`top:${76 + i * 68 + 56}px`"></div>
    </template>
    <a :href="nowPlayingHref" class="absolute left-[20px] top-[508px] whitespace-pre text-[12px] leading-normal font-semibold text-[#1a1a1a]">{{ 'See all 128 recommendations  →' }}</a>
  </aside>
</template>

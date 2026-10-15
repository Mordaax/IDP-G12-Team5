<script setup>
// Figma: "Artist drawer" (📸 9) — FallingIslands summary card.
import { ROUTES } from '@/data'
defineProps({ x: { type: Number, required: true }, y: { type: Number, required: true } })
const STATS = [
  { x: 20, value: '3k', vx: 15, label: 'fans' },
  { x: 130, value: '2', vx: 45.5, label: 'threads' },
  { x: 240, value: '4', vx: 45, label: 'collabs' },
]
const CHIPS = [
  { x: 20, y: 281, w: 72, t: 'Spotify' }, { x: 100, y: 281, w: 92, t: 'Bandcamp' },
  { x: 200, y: 281, w: 88, t: 'Instagram' }, { x: 20, y: 322, w: 80, t: 'YouTube' },
]
</script>

<template>
  <aside class="absolute h-[502px] w-[362px] rounded-[20px] bg-white shadow-[0px_6px_24px_0px_rgba(0,0,0,0.4)]" :style="`left:${x}px; top:${y}px`">
    <img src="/assets/img/fallingislands-avatar.jpg" alt="FallingIslands" width="58" height="58" class="absolute left-[20px] top-[20px] size-[58px] rounded-full object-cover" />
    <h2 class="absolute left-[91px] top-[22.5px] m-0 whitespace-nowrap text-[23px] leading-[1.4] font-bold text-[#1a1a1a]">FallingIslands</h2>
    <p class="absolute left-[91px] top-[57.5px] m-0 whitespace-nowrap text-[13px] leading-[1.4] text-[#6b6b6b]">Synthwave / EDM · Singapore</p>
    <button type="button" aria-label="Save artist" class="absolute left-[319px] top-[33.5px] text-[22px] leading-[1.4] text-[#a5a5a5]">♡</button>

    <div v-for="s in STATS" :key="s.label" class="absolute top-[93px] h-[60px] w-[102px] rounded-[12px] bg-[#f8f8f8]" :style="`left:${s.x}px`">
      <p class="absolute top-[10px] m-0 whitespace-nowrap text-[17px] leading-[1.4] font-bold text-[#1a1a1a]" :style="`left:${s.vx}px`">{{ s.value }}</p>
      <p class="absolute left-[15px] top-[35px] m-0 w-[72px] text-[11px] leading-[1.4] text-[#6b6b6b]">{{ s.label }}</p>
    </div>

    <p class="absolute left-[20px] top-[168px] m-0 w-[322px] text-[13px] leading-[1.4] text-[#1a1a1a]">I make bleeps, bloops, and sometimes even music.</p>
    <p class="absolute left-[20px] top-[194px] m-0 w-[322px] text-[12px] leading-[1.5] text-[#6b6b6b]">Logic Pro + Ableton Live Instructor @ POP Studio Academy<br />Resident DJ @ Blacklight Tribe<br />Assistant Tutor @ NUS Electronic Music Lab</p>

    <span v-for="c in CHIPS" :key="c.t" class="absolute block h-[33px] rounded-[999px] border border-[#e2e2e2] bg-[#f8f8f8]" :style="`left:${c.x}px; top:${c.y}px; width:${c.w}px`">
      <span class="absolute left-[14px] top-[7px] whitespace-nowrap text-[12px] leading-[1.4] font-medium text-[#1a1a1a]">{{ c.t }}</span>
    </span>

    <div class="absolute left-[20px] top-[370px] h-px w-[322px] bg-[#e2e2e2]"></div>
    <a :href="ROUTES.artist" class="absolute left-[20px] top-[386px] block h-[46px] w-[179px] rounded-[999px] bg-[#1a1a1a]">
      <span class="absolute left-[32.5px] top-[13px] whitespace-nowrap text-[14px] leading-[1.4] font-semibold text-white">Open artist page</span>
    </a>
    <a :href="ROUTES.recommended" class="absolute left-[208px] top-[386px] block h-[46px] w-[134px] rounded-[999px] border-[1.5px] border-[#1a1a1a] bg-white">
      <span class="absolute left-[16.5px] top-[11.5px] whitespace-nowrap text-[14px] leading-[1.4] font-semibold text-[#1a1a1a]">Not Interested</span>
    </a>
    <button type="button" class="absolute left-[20px] top-[447px] block h-[46px] w-[322px] rounded-[999px] bg-[#1a1a1a]">
      <span class="absolute left-[139px] top-[13px] whitespace-nowrap text-[14px] leading-[1.4] font-semibold text-white">Follow</span>
    </button>
  </aside>
</template>

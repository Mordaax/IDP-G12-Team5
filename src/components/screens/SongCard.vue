<script setup>
// Figma: "card / Pick your songs" (520 × 340).
import { computed } from 'vue'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  title: { type: String, required: true },
  added: { type: Array, required: true },
  addLeft: { type: Array, default: () => [17, 17, 17] },
})
const SONGS = [
  { title: 'Tracks of the Woods', sub: 'FallingIslands · Synthwave' },
  { title: 'Slow Burn', sub: 'Lullaboy · Pop Music' },
  { title: 'Night Lamp', sub: 'Sherman Zhuo · Contemporary Mandopop' },
]
const count = computed(() => props.added.filter(Boolean).length)
</script>

<template>
  <div class="absolute h-[340px] w-[520px] overflow-clip rounded-[12px] border border-[#ddd] bg-white" :style="`left:${x}px; top:${y}px`">
    <p class="absolute left-[23px] top-[23px] m-0 whitespace-nowrap text-[16px] leading-normal font-semibold text-[#1a1a1a]">{{ title }}</p>
    <p class="absolute left-[23px] top-[47px] m-0 whitespace-nowrap text-[12px] leading-normal text-[#888]">Preview a track, then add it to your profile.</p>

    <label class="absolute left-[23px] top-[79px] block h-[42px] w-[472px] rounded-[21px] bg-[#f4f4f5]">
      <img src="/assets/icons/glass.svg" alt="" width="12" height="12" class="absolute left-[16px] top-[15px]" />
      <input type="search" placeholder="Search a song or artist" class="absolute left-[40px] top-[12px] w-[400px] bg-transparent p-0 text-[13px] leading-normal text-[#1a1a1a] outline-none placeholder:text-[#999]" />
    </label>

    <template v-for="(s, i) in SONGS" :key="s.title">
      <div class="absolute left-[23px] size-[32px] rounded-[6px] bg-[#ddd]" :style="`top:${139 + i * 44}px`"></div>
      <p class="absolute left-[65px] m-0 whitespace-nowrap text-[13px] leading-normal font-semibold text-[#1a1a1a]" :style="`top:${139 + i * 44 + 2}px`">{{ s.title }}</p>
      <p class="absolute left-[65px] m-0 whitespace-nowrap text-[11px] leading-normal text-[#888]" :style="`top:${139 + i * 44 + 18}px`">{{ s.sub }}</p>
      <button type="button" :aria-label="`Preview ${s.title}`" class="absolute left-[393px] block size-[26px] overflow-clip rounded-[13px] border border-[#ddd] bg-white" :style="`top:${139 + i * 44 + 4}px`">
        <span class="absolute left-[9px] top-[7px] whitespace-nowrap text-[9px] leading-normal text-[#888]">▶</span>
      </button>
      <button v-if="added[i]" type="button" class="absolute left-[427px] block h-[26px] w-[68px] rounded-[13px] bg-[#1a1a1a]" :style="`top:${139 + i * 44 + 4}px`">
        <span class="absolute left-[16px] top-[7px] whitespace-nowrap text-[11px] leading-normal font-semibold text-white">Added</span>
      </button>
      <button v-else type="button" class="absolute left-[427px] block h-[26px] w-[68px] rounded-[13px] border border-[#ddd] bg-white" :style="`top:${139 + i * 44 + 4}px`">
        <span class="absolute top-[6px] whitespace-nowrap text-[11px] leading-normal font-semibold text-[#1a1a1a]" :style="`left:${addLeft[i]}px`">+ Add</span>
      </button>
    </template>

    <p class="absolute left-[23px] top-[299px] m-0 whitespace-nowrap text-[12px] leading-normal text-[#666]">{{ count }} songs added</p>
  </div>
</template>

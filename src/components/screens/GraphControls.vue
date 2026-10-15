<script setup>
// Figma: "Graph controls" — artist search, Genres & Moods filter card, stats pill.
import { GENRES, ROUTES } from '@/data'

const MOODS = [
  { name: 'Chill', on: true },
  { name: 'Upbeat', on: false },
  { name: 'Late night', on: true },
  { name: 'Euphoric', on: false },
  { name: 'Melancholy', on: false },
  { name: 'Raw', on: false },
]
</script>

<template>
  <div class="absolute left-[36px] top-[24px] flex h-[539px] w-[300px] flex-col items-start gap-[12px] overflow-clip">
    <!-- search pill -->
    <label class="flex w-[300px] shrink-0 items-center gap-[10px] overflow-clip rounded-[999px] ring-1 ring-inset ring-line bg-white py-[12px] pl-[16px] pr-[18px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)]">
      <img src="/assets/icons/search-15.svg" alt="" width="15" height="15" class="size-[15px] shrink-0" />
      <input type="search" placeholder="Search artists…" class="w-full min-w-0 bg-transparent p-0 text-[13px] leading-[1.4] text-ink outline-none placeholder:text-muted" />
    </label>

    <!-- Genres & Moods filter card -->
    <div class="flex h-[438px] w-[300px] shrink-0 flex-col items-start gap-[8px] overflow-clip rounded-[16px] ring-1 ring-inset ring-line bg-white p-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.3)]">
      <div class="flex h-[38px] w-[268px] shrink-0 items-center gap-[9px] overflow-clip rounded-[10px] ring-1 ring-inset ring-line bg-[#f4f4f5] px-[12px]">
        <img src="/assets/icons/search-13.svg" alt="" width="13" height="13" class="size-[13px] shrink-0" />
        <p class="m-0 min-w-px flex-1 text-[13px] leading-[1.4] text-ink">Genres</p>
        <span class="relative size-[14px] shrink-0" aria-hidden="true">
          <span class="absolute left-0 top-[3px] h-[1.5px] w-[14px] rounded-[1px] bg-muted"></span>
          <span class="absolute left-[2px] top-[7px] h-[1.5px] w-[10px] rounded-[1px] bg-muted"></span>
          <span class="absolute left-[4px] top-[11px] h-[1.5px] w-[6px] rounded-[1px] bg-muted"></span>
        </span>
      </div>

      <ul class="m-0 flex h-[192px] w-[268px] shrink-0 list-none flex-col items-start p-0">
        <li v-for="g in GENRES" :key="g.key" class="flex h-[32px] w-[258px] shrink-0">
          <component :is="g.key === 'electronic' ? 'a' : 'span'" :href="g.key === 'electronic' ? ROUTES.discoverElectronic : undefined" class="flex w-full items-center gap-[9px]">
            <img src="/assets/icons/checkbox-checked.svg" alt="" width="16" height="16" class="size-[16px] shrink-0" />
            <span class="size-[9px] shrink-0 rounded-full" :style="`background:${g.dot}`"></span>
            <span class="min-w-px flex-1 text-[13px] leading-[1.4] font-medium text-ink">{{ g.name }}</span>
          </component>
        </li>
      </ul>

      <div class="h-px w-[268px] shrink-0 bg-divider"></div>
      <p class="m-0 shrink-0 whitespace-nowrap text-[11px] leading-[1.4] font-bold tracking-[0.66px] text-muted">MOODS</p>

      <div class="flex w-[268px] shrink-0 flex-wrap content-start items-start gap-x-[11px] gap-y-[12px] overflow-clip">
        <div v-for="m in MOODS" :key="m.name" class="flex w-[82px] shrink-0 flex-col items-start gap-[5px]">
          <img :src="m.on ? '/assets/icons/switch-on.svg' : '/assets/icons/switch-off.svg'" alt="" width="34" height="18" class="h-[18px] w-[34px]" />
          <p :class="`m-0 w-full text-[11px] leading-[1.4] ${m.on ? 'font-medium text-ink-2' : 'font-normal text-[#4a4852]'}`">{{ m.name }}</p>
        </div>
      </div>

      <div class="flex h-[32px] w-full shrink-0 items-center justify-end overflow-clip">
        <button type="button" class="flex items-center justify-center overflow-clip rounded-[999px] bg-[#1e1e1e] px-[14px] py-[8px] text-[12px] leading-normal text-white">Hide</button>
      </div>
    </div>

    <!-- stats pill -->
    <div class="flex shrink-0 items-center gap-[8px] overflow-clip rounded-[12px] ring-1 ring-inset ring-line bg-white px-[14px] py-[9px]">
      <span class="size-[9px] shrink-0 rounded-full bg-[#a98be0]"></span>
      <p class="m-0 whitespace-nowrap text-[12px] leading-[1.4] text-muted">178 artists · 412 shared-audience links</p>
    </div>
  </div>
</template>

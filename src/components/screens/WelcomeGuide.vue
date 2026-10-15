<script setup>
// Figma: "panel / Welcome (walkthrough guide)" — 400 × 669, signed-out only.
import { ROUTES } from '@/data'

const STEPS = [
  { top: 188, title: 'Click on the dots', body: 'One dot, one artist. Find new artists' },
  { top: 255, title: 'Follow the lines', body: 'A line means two artists share an audience — so one band you love leads you to the next.' },
  { top: 322, title: 'Narrow the search', body: 'Search finds artists only. Use the genre filter to light up one scene at a time.' },
  { top: 389, title: 'Open anything', body: 'Click a dot for that artist’s page, gigs and threads. Recentre resets the whole view.' },
]
</script>

<template>
  <aside class="absolute left-[1000px] top-[24px] h-[669px] w-[400px] rounded-[16px] border border-line bg-white shadow-[0px_10px_12px_0px_rgba(0,0,0,0.35)]">
    <p class="absolute left-[23px] top-[23px] m-0 w-[200px] text-[11px] leading-[15px] font-bold text-muted">HOW TO READ THIS MAP</p>
    <h1 class="absolute left-[23px] top-[48px] m-0 w-[352px] text-[24px] leading-[32px] font-semibold text-ink-2">Your 4-step guide to the web of dots.</h1>
    <p class="absolute left-[23px] top-[124px] m-0 w-[352px] text-[14px] leading-[22px] text-muted">Every dot is an artist playing in Singapore; the lines are the audiences they share.</p>

    <template v-for="(s, i) in STEPS" :key="s.title">
      <span class="absolute left-[23px] flex size-[24px] items-center justify-center text-[12px] leading-[24px] font-bold text-ink-2" :style="`top:${s.top}px`">
        <img src="/assets/icons/step-badge.svg" alt="" width="24" height="24" class="absolute inset-0" />
        <span class="relative">{{ i + 1 }}</span>
      </span>
      <p class="absolute left-[59px] m-0 w-[316px] text-[14px] leading-[18px] font-semibold text-ink-2" :style="`top:${s.top + 3}px`">{{ s.title }}</p>
      <p class="absolute left-[59px] m-0 w-[316px] text-[13px] leading-[17px] text-muted" :style="`top:${s.top + 25}px`">{{ s.body }}</p>
    </template>

    <div class="absolute left-[23px] top-[462px] h-px w-[352px] bg-divider"></div>
    <a :href="ROUTES.signup" class="absolute left-[23px] top-[484px] flex h-[48px] w-[352px] items-center justify-center overflow-clip rounded-[24px] bg-brand text-[15px] leading-[18px] font-semibold text-white">Create an account</a>
    <button type="button" class="absolute left-[23px] top-[544px] flex h-[48px] w-[352px] items-center justify-center overflow-clip rounded-[24px] border border-line pr-[2px] pb-[2px] text-[15px] leading-[18px] font-semibold text-ink-2">Log in</button>
    <p class="absolute left-[23px] top-[608px] m-0 w-[352px] text-[12px] leading-[17px] text-muted">Keep browsing as a guest — this guide stays available from the ? Help icon on the map.</p>
  </aside>
</template>

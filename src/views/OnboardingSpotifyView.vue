<script setup>
// 📸 6 Onboarding (connect spotify) — profile filled from Spotify.
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import OnboardingHeader from '@/components/screens/OnboardingHeader.vue'
import GenreCard from '@/components/screens/GenreCard.vue'
import SongCard from '@/components/screens/SongCard.vue'
import { GENRE_BY_KEY, ROUTES } from '@/data'

const PROFILE = [
  { pct: '62% Electronic', dot: GENRE_BY_KEY.electronic.dot, left: 550, w: 124 },
  { pct: '25% Pop Music', dot: GENRE_BY_KEY.pop.dot, left: 684, w: 127 },
  { pct: '13% Contemporary Mandopop', dot: GENRE_BY_KEY.mandopop.dot, left: 821, w: 214 },
]
</script>

<template>
  <ScreenFrame>
    <OnboardingHeader title="Let’s build your taste profile" subtitle="Connect a music service, or pick genres and songs by hand — either way takes a minute." />

    <GenreCard :x="185" :y="230" title="Pick your genres" chip-style="dark"
      :selected="['Pop Music', 'Contemporary Mandopop', 'Electronic', 'Synthwave']"
      summary="4 selected · 3 genres, 1 subgenre" />
    <SongCard :x="730" :y="229" title="Pick your songs" :added="[true, true, false]" />

    <div class="absolute left-[185px] top-[590px] h-[72px] w-[1060px] overflow-clip rounded-[12px] border border-[#ddd] bg-[#f7f7f7]">
      <p class="absolute left-[23px] top-[15px] m-0 whitespace-nowrap text-[10px] leading-normal font-semibold text-[#888]">YOUR TASTE PROFILE</p>
      <p class="absolute left-[23px] top-[37px] m-0 whitespace-nowrap text-[12px] leading-normal text-[#666]">Updates as you pick. You can change it any time.</p>
      <div v-for="p in PROFILE" :key="p.pct" class="absolute top-[20px] h-[30px] overflow-clip rounded-[15px] border border-[#ddd] bg-white" :style="`left:${p.left}px; width:${p.w}px`">
        <span class="absolute left-[11px] top-[10px] size-[8px] rounded-full" :style="`background:${p.dot}`"></span>
        <span class="absolute left-[25px] top-[6px] whitespace-nowrap text-[12px] leading-normal text-[#1a1a1a]">{{ p.pct }}</span>
      </div>
    </div>

    <a :href="ROUTES.forYou" class="absolute left-1/2 top-[705px] block h-[48px] w-[240px] -translate-x-1/2 rounded-[24px] bg-[#007aff]">
      <span class="absolute left-[92px] top-[15px] whitespace-pre text-[15px] leading-normal font-semibold text-white">{{ 'Next  →' }}</span>
    </a>
  </ScreenFrame>
</template>

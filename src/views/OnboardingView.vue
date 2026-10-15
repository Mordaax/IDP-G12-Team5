<script setup>
// 📸 5 Onboarding (before connect spotify) — Figma 1431:2207.
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import OnboardingHeader from '@/components/screens/OnboardingHeader.vue'
import { ROUTES } from '@/data'

const CARDS = [
  { top: 204, title: 'Connect Spotify', body: 'Reads your top artists and recent plays — we never post anything.', cta: 'Connect', ctaLeft: 49, href: ROUTES.onboardingSpotify },
  { top: 336, title: 'Connect Apple Music', body: 'Reads your library and recent listening — nothing is shared publicly.', cta: 'Connect', ctaLeft: 49, href: ROUTES.onboardingSpotify },
  { top: 468, title: 'Create your taste profile manually', body: 'Choose your genres and songs yourself — no streaming account needed.', cta: 'Choose manually', ctaLeft: 19.5, href: ROUTES.onboardingManual, wide: true },
]
</script>

<template>
  <ScreenFrame>
    <OnboardingHeader title="Let’s build your taste profile" subtitle="Connect a music service, or create your taste profile manually — either way takes a minute." />

    <div v-for="c in CARDS" :key="c.title" class="absolute left-[340px] h-[112px] w-[760px] overflow-clip rounded-[12px] border border-[#ddd] bg-white" :style="`top:${c.top}px`">
      <div class="absolute left-[19px] top-[27px] size-[56px] rounded-[12px] border border-dashed border-[#bbb]"></div>
      <p class="absolute left-[87px] top-[27px] m-0 whitespace-nowrap text-[16px] leading-normal font-semibold text-[#1a1a1a]">{{ c.title }}</p>
      <p v-if="c.wide" class="absolute left-[87px] top-[51px] m-0 whitespace-nowrap text-[12px] leading-normal text-[#888]">{{ c.body }}</p>
      <p v-else class="absolute left-[87px] top-[51px] m-0 w-[236px] text-[12px] leading-[16px] text-[#666]">{{ c.body }}</p>
      <a :href="c.href" class="absolute left-[579px] top-[33px] block h-[44px] w-[156px] rounded-[22px] bg-[#1a1a1a]">
        <span class="absolute top-[14px] whitespace-nowrap text-[14px] leading-normal font-semibold text-white" :style="`left:${c.ctaLeft}px`">{{ c.cta }}</span>
      </a>
    </div>

    <div class="absolute left-[340px] top-[620px] h-[72px] w-[760px] overflow-clip whitespace-nowrap rounded-[12px] border border-[#ddd] bg-[#f7f7f7] leading-normal">
      <p class="absolute left-[23px] top-[15px] m-0 text-[10px] font-semibold text-[#888]">YOUR TASTE PROFILE</p>
      <p class="absolute left-[23px] top-[37px] m-0 text-[12px] text-[#666]">Updates as you pick. You can change it any time.</p>
      <p class="absolute left-[429px] top-[27px] m-0 text-[13px] text-[#888]">Nothing picked yet — choose an option above.</p>
    </div>
  </ScreenFrame>
</template>

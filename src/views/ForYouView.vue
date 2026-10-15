<script setup>
// 📸 7 Discover (for you) — signed in, taste profile highlighted.
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import NavBar from '@/components/screens/NavBar.vue'
import GraphLayer from '@/components/screens/GraphLayer.vue'
import SignedInControls from '@/components/screens/SignedInControls.vue'
import TasteChips from '@/components/screens/TasteChips.vue'
import DarkMapButtons from '@/components/screens/DarkMapButtons.vue'
import TasteLabel from '@/components/screens/TasteLabel.vue'
import RecommendedPanel from '@/components/screens/RecommendedPanel.vue'
import { GRAPHS, ROUTES } from '@/data'

const { DOTS, LINKS } = GRAPHS.forYou
const LABELS = [
  [247, 254, 12, 500, '#4e6df5', 'Indie Rock'], [645, 246, 12, 500, '#ec6a9c', 'Contemporary Mandopop'],
  [783, 523, 12, 500, '#f5a524', 'Hip-Hop'], [506, 108, 12, 500, '#0fb3a1', 'Electronic'],
  [149, 486, 12, 500, '#3fa96a', 'Traditional Ethnic Music'], [406, 630, 12, 500, '#8b5cf6', 'Pop Music'],
  [506, 418, 12, 500, '#4a4a4a', 'Synthwave'],
]
const linkHrefs = { Synthwave: ROUTES.recommended }
</script>

<template>
  <ScreenFrame>
    <NavBar active="discover" />
    <section class="absolute left-0 top-[72px] h-[828px] w-[1440px] overflow-clip bg-white" aria-label="Your web of artists">
      <GraphLayer :dots="DOTS" :links="[LINKS]" :labels="LABELS" :link-hrefs="linkHrefs" />
      <SignedInControls />
      <TasteChips />
      <TasteLabel :x="564" :y="533" :href="ROUTES.recommended" />
      <RecommendedPanel :x="1073" :y="92" :now-playing-href="ROUTES.artistWidget" metal-dot="#64748b" />
      <DarkMapButtons />
    </section>
    <!-- your position on the map (sits on the frame in Figma) -->
    <a :href="ROUTES.recommended" aria-label="Zoom into your taste profile" class="absolute left-[523px] top-[549px] block h-[18px] w-[19px] rounded-full border-2 border-brand"></a>
  </ScreenFrame>
</template>

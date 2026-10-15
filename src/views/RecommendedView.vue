<script setup>
// 📸 8 Discover — zoomed into Synthwave, recommendations open.
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import NavBar from '@/components/screens/NavBar.vue'
import GraphLayer from '@/components/screens/GraphLayer.vue'
import SignedInControls from '@/components/screens/SignedInControls.vue'
import TasteChips from '@/components/screens/TasteChips.vue'
import DarkMapButtons from '@/components/screens/DarkMapButtons.vue'
import TasteLabel from '@/components/screens/TasteLabel.vue'
import RecommendedPanel from '@/components/screens/RecommendedPanel.vue'
import { GRAPHS, ROUTES } from '@/data'

const { DOTS, LINKS, LABELS } = GRAPHS.zoom
</script>

<template>
  <ScreenFrame>
    <section class="absolute left-0 top-[72px] h-[828px] w-[1440px] overflow-clip bg-white" aria-label="Synthwave cluster">
      <GraphLayer :dots="DOTS" :links="[LINKS]" :labels="LABELS" />
      <p class="absolute left-[416px] top-[654px] m-0 whitespace-nowrap text-[12px] leading-[1.4] font-medium text-[#8b5cf6]">Pop Music</p>
      <a :href="ROUTES.artistWidget" aria-label="FallingIslands" class="absolute left-[603px] top-[441px] block h-[29px] w-[30px] rounded-full border-2 border-brand"></a>
      <SignedInControls />
      <TasteChips />
      <TasteLabel :x="564" :y="533" large />
      <DarkMapButtons :recentre-href="ROUTES.forYou" />
    </section>
    <!-- subgenre labels sit on the frame in Figma -->
    <p class="absolute left-[576px] top-[421px] m-0 whitespace-nowrap text-[16px] leading-[1.4] font-medium text-[#4a4a4a]">Synthwave</p>
    <p class="absolute left-[615px] top-[204px] m-0 whitespace-nowrap text-[16px] leading-[1.4] font-medium text-[#4a4a4a]">Trance</p>
    <p class="absolute left-[372px] top-[432px] m-0 whitespace-nowrap text-[16px] leading-[1.4] font-medium text-[#4a4a4a]">Hardcore</p>
    <NavBar active="discover" />
    <RecommendedPanel :x="1073" :y="92" :now-playing-href="ROUTES.artistWidget" :close-href="ROUTES.forYou" metal-dot="#737373" />
  </ScreenFrame>
</template>

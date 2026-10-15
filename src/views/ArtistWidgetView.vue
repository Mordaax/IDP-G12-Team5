<script setup>
// 📸 9 Discover (artist widget expanded).
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import NavBar from '@/components/screens/NavBar.vue'
import GraphLayer from '@/components/screens/GraphLayer.vue'
import SignedInControls from '@/components/screens/SignedInControls.vue'
import TasteChips from '@/components/screens/TasteChips.vue'
import DarkMapButtons from '@/components/screens/DarkMapButtons.vue'
import TasteLabel from '@/components/screens/TasteLabel.vue'
import ArtistDrawer from '@/components/screens/ArtistDrawer.vue'
import { GRAPHS, ROUTES } from '@/data'

const { DOTS, LINKS, LABELS } = GRAPHS.zoom
</script>

<template>
  <ScreenFrame>
    <section class="absolute left-0 top-[72px] h-[828px] w-[1440px] overflow-clip bg-white" aria-label="Synthwave cluster">
      <GraphLayer :dots="DOTS" :links="[LINKS]" :labels="LABELS" />
      <p class="absolute left-[385px] top-[643px] m-0 whitespace-nowrap text-[12px] leading-[1.4] font-medium text-[#8b5cf6]">Pop Music</p>
      <span class="absolute left-[603px] top-[441px] block h-[29px] w-[30px] rounded-full border-2 border-brand"></span>
      <SignedInControls />
      <TasteChips />
      <DarkMapButtons :recentre-href="ROUTES.forYou" />
      <ArtistDrawer :x="999" :y="38" />
    </section>
    <!-- subgenre labels sit on the frame in Figma -->
    <p class="absolute left-[576px] top-[421px] m-0 whitespace-nowrap text-[16px] leading-[1.4] font-medium text-[#4a4a4a]">Synthwave</p>
    <p class="absolute left-[615px] top-[204px] m-0 whitespace-nowrap text-[16px] leading-[1.4] font-medium text-[#4a4a4a]">Trance</p>
    <p class="absolute left-[372px] top-[432px] m-0 whitespace-nowrap text-[16px] leading-[1.4] font-medium text-[#4a4a4a]">Hardcore</p>
    <TasteLabel :x="544" :y="587" large />
    <NavBar active="discover" />
  </ScreenFrame>
</template>

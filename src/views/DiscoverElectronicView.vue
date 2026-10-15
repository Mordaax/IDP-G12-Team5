<script setup>
// 📸 2 Discover (electronic music subgenres) — the whole map area sits 17px further left in this frame.
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import NavBar from '@/components/screens/NavBar.vue'
import GraphLayer from '@/components/screens/GraphLayer.vue'
import GraphControls from '@/components/screens/GraphControls.vue'
import Legend from '@/components/screens/Legend.vue'
import MapButtons from '@/components/screens/MapButtons.vue'
import WelcomeGuide from '@/components/screens/WelcomeGuide.vue'
import { GRAPHS, ROUTES } from '@/data'

const { DOTS, LINKS, LABELS, PHOTOS } = GRAPHS.electronic
const linkHrefs = { Synthwave: ROUTES.signup }
</script>

<template>
  <ScreenFrame>
    <section class="absolute left-[-17px] top-[72px] h-[828px] w-[1440px] overflow-clip bg-white" aria-label="Electronic subgenres">
      <GraphLayer :dots="DOTS" :links="[LINKS]" :labels="LABELS" :photos="PHOTOS" :link-hrefs="linkHrefs" />
      <GraphControls />
      <Legend />
      <MapButtons />
      <WelcomeGuide />
    </section>
    <NavBar active="discover" variant="signed-out" />
  </ScreenFrame>
</template>

<script setup>
// 📸 1 Discover (web of dots) — signed-out landing.
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import NavBar from '@/components/screens/NavBar.vue'
import DiscoverMap from '@/components/screens/DiscoverMap.vue'
</script>

<template>
  <ScreenFrame>
    <DiscoverMap />
    <NavBar active="discover" variant="signed-out" />
  </ScreenFrame>
</template>

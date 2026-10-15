<script setup>
// Figma: "Discover background" (blur 4) + "Overlay" (black 70%) behind the sign-up card.
import DiscoverMap from './DiscoverMap.vue'
</script>

<template>
  <div class="pointer-events-none absolute inset-0 blur-[2px]" aria-hidden="true" inert>
    <DiscoverMap />
  </div>
  <div class="absolute left-[-3px] top-[70px] h-[828px] w-[1440px] bg-black/70 shadow-[inset_0_0_10px_rgba(0,0,0,0.25)]"></div>
</template>

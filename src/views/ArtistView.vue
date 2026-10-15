<script setup>
// 📸 10 Artist page (portfolio) · 📸 11 Artist page (upcoming events).
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import ArtistPage from '@/components/screens/ArtistPage.vue'
defineProps({ tab: { type: String, required: true } })
</script>

<template>
  <ScreenFrame><ArtistPage :tab="tab" /></ScreenFrame>
</template>

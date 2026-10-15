<script setup>
// 📸 15 Forum (browse) · 📸 16 (typing a reply) · 📸 17 (reply posted).
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import Thread from '@/components/screens/Thread.vue'
defineProps({ state: { type: String, required: true } })
</script>

<template>
  <ScreenFrame><Thread :state="state" /></ScreenFrame>
</template>

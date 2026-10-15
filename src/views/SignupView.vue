<script setup>
// 📸 3 Auth (Sign up) — empty form · 📸 4 Auth (Kit Tan Sign up) — filled, ready to submit.
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import NavBar from '@/components/screens/NavBar.vue'
import SignupBackdrop from '@/components/screens/SignupBackdrop.vue'
import AuthCard from '@/components/screens/AuthCard.vue'
defineProps({ filled: { type: Boolean, default: false } })
</script>

<template>
  <ScreenFrame>
    <SignupBackdrop />
    <NavBar active="discover" variant="signed-out" />
    <AuthCard :filled="filled" />
  </ScreenFrame>
</template>

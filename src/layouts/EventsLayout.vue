<script setup>
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fontsource-variable/plus-jakarta-sans'
import '../assets/styles/main.css'

import AppNavbar from '@/components/layout/AppNavbar.vue'
import ToastHost from '@/components/layout/ToastHost.vue'
</script>

<template>
  <AppNavbar />
  <main class="app-main">
    <RouterView />
  </main>
  <ToastHost />
</template>

<style scoped>
.app-main {
  min-height: calc(100vh - var(--navbar-height));
}
</style>

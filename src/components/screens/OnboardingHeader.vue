<script setup>
// Shared top of 📸 5, 📸 6 and the manual taste-profile screen.
import NavBar from './NavBar.vue'
import { ROUTES } from '@/data'
defineProps({ title: { type: String, required: true }, subtitle: { type: String, required: true } })
</script>

<template>
  <NavBar active="discover" />
  <div class="absolute left-0 top-[72px] h-px w-[1440px] bg-[#eee]"></div>
  <a :href="ROUTES.forYou" class="absolute left-[1327px] top-[100px] whitespace-nowrap text-[12px] leading-normal font-semibold text-[#1a1a1a]">Skip for now</a>
  <h1 class="absolute left-1/2 top-[116px] m-0 w-[560px] -translate-x-1/2 text-center text-[30px] leading-normal font-semibold text-[#1a1a1a]">{{ title }}</h1>
  <p class="absolute left-1/2 top-[160px] m-0 w-[660px] -translate-x-1/2 text-center text-[14px] leading-normal text-[#666]">{{ subtitle }}</p>
</template>

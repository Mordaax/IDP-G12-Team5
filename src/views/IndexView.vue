<script setup>
// Screen directory — handy during the build and for usability-test links.
import '@/assets/styles/screens.js'
import { SCREENS } from '@/data'
const done = SCREENS.filter((s) => s.built).length
</script>

<template>
  <div class="mx-auto max-w-[760px] px-6 py-12 text-ink">
    <img src="/assets/img/brand.png" alt="LittleRedMusic" width="48" height="48" />
    <h1 class="mt-4 mb-1 text-[28px] font-semibold">Hi Fi screens</h1>
    <p class="m-0 text-muted">{{ done }} of {{ SCREENS.length }} screens built from the Figma page “8 Hi Fi Screens”.</p>
    <ol class="mt-8 list-none divide-y divide-[#eee] border-y border-[#eee] p-0">
      <li v-for="s in SCREENS" :key="s.path" class="flex items-center justify-between gap-4 py-3">
        <a v-if="s.built" :href="s.path" class="font-medium underline decoration-[#ccc] underline-offset-4 hover:decoration-ink">{{ s.figma }}</a>
        <span v-else class="text-[#9a98a0]">{{ s.figma }}</span>
        <code class="shrink-0 text-[12px] text-muted">{{ s.path }}</code>
      </li>
    </ol>
  </div>
</template>

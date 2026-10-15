<script setup>
// Figma: "taste-label" pill.
defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  href: { type: String, default: undefined },
  large: { type: Boolean, default: false },
})
</script>

<template>
  <component :is="href ? 'a' : 'div'" v-if="large" :href="href" class="absolute block h-[37px] w-[206px] rounded-[18.5px] border border-brand bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]" :style="`left:${x}px; top:${y}px`">
    <span class="absolute left-[11px] top-[13px] size-[8px] rounded-full bg-brand"></span>
    <span class="absolute left-[27px] top-[5px] whitespace-nowrap text-[20px] leading-[24px] font-semibold text-[#1a1a1a]">Your taste profile</span>
  </component>
  <component :is="href ? 'a' : 'div'" v-else :href="href" class="absolute block h-[30px] w-[168px] rounded-[15px] border border-brand bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]" :style="`left:${x}px; top:${y}px`">
    <span class="absolute left-[11px] top-[10px] size-[8px] rounded-full bg-brand"></span>
    <span class="absolute left-[27px] top-[6px] whitespace-nowrap text-[12px] leading-normal font-semibold text-[#1a1a1a]">Your taste profile</span>
  </component>
</template>

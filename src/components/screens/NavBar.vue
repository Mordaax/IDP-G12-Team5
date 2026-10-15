<script setup>
// Figma: nav-bar (1440 × 72).
//   signed-out → "Sign up" / "Log in" pills (📸 1–4)
//   signed-in  → bell (→ Notifications) + user avatar + name (Kit Tan, from db.json) (every other screen)
import { computed } from 'vue'
import { ROUTES, USER } from '@/data'

const props = defineProps({
  active: { type: String, default: 'discover' },
  variant: { type: String, default: 'signed-in' },
})
const signedIn = computed(() => props.variant === 'signed-in')
const links = computed(() => [
  { key: 'discover', label: 'Discover', href: signedIn.value ? ROUTES.forYou : ROUTES.discover },
  { key: 'events', label: 'Events', href: signedIn.value ? ROUTES.eventsMap : ROUTES.signup },
  { key: 'artists', label: 'Artists', href: signedIn.value ? ROUTES.artist : ROUTES.signup },
  { key: 'forum', label: 'Forum', href: signedIn.value ? ROUTES.thread : ROUTES.signup },
])
</script>

<template>
  <header class="absolute left-0 top-0 z-20 flex h-[72px] w-[1440px] items-center justify-between border-b border-[#e5e7eb] bg-white px-[24px] py-[16px]">
    <a :href="signedIn ? ROUTES.forYou : ROUTES.discover" class="relative block size-[40px] shrink-0" aria-label="LittleRedMusic home">
      <img src="/assets/img/brand.png" alt="" class="size-full object-contain" width="40" height="40" />
    </a>

    <nav class="flex items-center gap-[24px] whitespace-nowrap font-sf text-[14px] leading-normal font-semibold">
      <a v-for="l in links" :key="l.key" :href="l.href" :class="l.key === active ? 'text-[#111827]' : 'text-[#6b7280]'" :aria-current="l.key === active ? 'page' : undefined">{{ l.label }}</a>
    </nav>

    <div v-if="signedIn" class="flex items-center gap-[12px]">
      <a :href="ROUTES.notifications" class="flex size-[24px] shrink-0 items-center" aria-label="Notifications">
        <img src="/assets/icons/bell.svg" alt="" width="24" height="24" />
      </a>
      <span class="flex size-[36px] shrink-0 items-center justify-center rounded-[18px] bg-[#e5e7eb] font-sf text-[13px] leading-normal font-bold text-[#111827]">{{ USER.initials }}</span>
      <span class="whitespace-nowrap text-[13px] leading-normal font-medium text-[#1a1a1a]">{{ USER.name }}</span>
    </div>
    <div v-else class="flex items-start gap-[10px]">
      <a :href="ROUTES.signup" class="relative block h-[36px] w-[84px] rounded-[18px] bg-[#1a1a1a]">
        <span class="absolute left-[23px] top-[10px] whitespace-nowrap text-[13px] leading-normal font-semibold text-white">Sign up</span>
      </a>
      <a :href="ROUTES.signup" class="relative block h-[36px] w-[84px] rounded-[18px] bg-[#1a1a1a]">
        <span class="absolute left-[23px] top-[10px] whitespace-nowrap text-[13px] leading-normal font-semibold text-white">Log in</span>
      </a>
    </div>
  </header>
</template>

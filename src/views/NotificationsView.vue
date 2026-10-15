<script setup>
// Notifications — Figma 1439:170. This frame uses its own 64px nav.
import ScreenFrame from '@/components/screens/ScreenFrame.vue'
import { ROUTES, USER } from '@/data'

const TABS = [
  { label: 'All', x: 40, w: 43, on: true }, { label: 'Unread', x: 91, w: 71 },
  { label: 'Mentions', x: 170, w: 83 }, { label: 'Follows', x: 261, w: 72 },
  { label: 'Events', x: 341, w: 68 }, { label: 'Replies', x: 417, w: 71 },
  { label: 'System', x: 496, w: 72 },
]
const ROWS = [
  { who: 'A', text: ' liked your comment on “Abcde”', time: '2h ago', unread: true },
  { who: 'B', text: ' started following you', time: '4h ago', unread: true },
  { who: 'C', text: ' mentioned you in a post: "@aryan check out this new track!"', time: '1d ago', unread: true },
  { who: '', text: 'New event added near you: "Homegrown Sounds" at Esplanade Annexe Studio', time: '1d ago' },
  { who: 'D', text: ' replied to your comment: "Thanks for the support!"', time: '2d ago' },
  { who: 'E', text: ' liked your post on "Best local R&B artists?"', time: '3d ago' },
  { who: '', text: "Weekly digest is ready! Check out this week's top artists and events.", time: '5d ago' },
]
const SETTINGS = ['New gigs near me', 'Artists I follow', 'Forum replies', 'Mentions', 'Follows', 'Weekly digest']
</script>

<template>
  <ScreenFrame>
    <!-- 64px nav used on this frame -->
    <header class="absolute left-0 top-0 h-[64px] w-[1440px] border-b border-[#e0e0e0] bg-white">
      <a :href="ROUTES.forYou" class="absolute left-[40px] top-[12px] block size-[40px]" aria-label="LittleRedMusic home">
        <img src="/assets/img/brand.png" alt="" width="40" height="40" class="size-full object-contain" />
      </a>
      <nav class="absolute left-[532px] top-[24px] flex gap-[32px] whitespace-nowrap text-[14px] leading-normal font-medium text-[#666]">
        <a :href="ROUTES.forYou">Discover</a><a :href="ROUTES.eventsMap">Events</a><a :href="ROUTES.artist">Artists</a><a :href="ROUTES.thread">Forum</a>
      </nav>
      <img src="/assets/icons/bell.svg" alt="" width="24" height="24" class="absolute left-[1272px] top-[20px]" />
      <span class="absolute left-[1308px] top-[14px] flex size-[36px] items-center justify-center rounded-[18px] bg-[#e7e7e7] text-[13px] leading-normal font-bold text-[#181818]">{{ USER.initials }}</span>
      <span class="absolute left-[1356px] top-[24px] whitespace-nowrap text-[13px] leading-normal font-medium text-[#1a1a1a]">{{ USER.name }}</span>
    </header>

    <h1 class="absolute left-[40px] top-[84px] m-0 whitespace-nowrap text-[28px] leading-normal font-semibold text-[#1a1a1a]">Notifications</h1>
    <button type="button" class="absolute left-[1302px] top-[93px] whitespace-nowrap text-[13px] leading-normal font-medium text-[#666]">Mark all as read</button>

    <button v-for="t in TABS" :key="t.label" type="button" :aria-pressed="t.on ? 'true' : 'false'"
      :class="`absolute top-[138px] flex h-[31px] items-center justify-center rounded-[100px] text-[12px] leading-normal font-semibold ${t.on ? 'bg-[#111] text-white' : 'border border-[#e0e0e0] bg-white text-[#666]'}`"
      :style="`left:${t.x}px; width:${t.w}px`">{{ t.label }}</button>

    <ul class="absolute left-[40px] top-[189px] m-0 h-[671px] w-[956px] list-none overflow-clip rounded-[12px] border border-[#e0e0e0] bg-white p-0">
      <li v-for="(r, i) in ROWS" :key="i" class="absolute left-[-1px] h-[68px] w-[956px] border-b border-[#e0e0e0]" :style="`top:${i * 68 - 1}px`">
        <span class="absolute left-[16px] top-[16px] size-[36px] rounded-full border border-[#e0e0e0] bg-[#e5e5e5]"></span>
        <p class="absolute left-[64px] top-[19px] m-0 w-[876px] text-[13px] leading-normal text-[#111]"><b v-if="r.who" class="font-bold">{{ r.who }}</b>{{ r.text }}</p>
        <p class="absolute left-[64px] top-[37px] m-0 whitespace-nowrap text-[11px] leading-normal text-[#999]">{{ r.time }}</p>
        <span v-if="r.unread" class="absolute left-[934px] top-[31px] size-[6px] rounded-full bg-[#686868]"></span>
      </li>
    </ul>

    <section class="absolute left-[1020px] top-[189px] h-[327px] w-[380px] rounded-[12px] border border-[#e0e0e0] bg-white">
      <h2 class="absolute left-[23px] top-[23px] m-0 whitespace-nowrap text-[16px] leading-normal font-bold text-[#111]">Notification settings</h2>
      <p class="absolute left-[23px] top-[46px] m-0 whitespace-nowrap text-[12px] leading-normal text-[#666]">Choose how you want to be notified</p>
      <div class="absolute left-[23px] top-[81px] h-px w-[332px] bg-[#e0e0e0]"></div>
      <template v-for="(s, i) in SETTINGS" :key="s">
        <p class="absolute left-[23px] m-0 whitespace-nowrap text-[13px] leading-normal font-medium text-[#111]" :style="`top:${104 + i * 36}px`">{{ s }}</p>
        <button type="button" role="switch" aria-checked="true" :aria-label="s" class="absolute left-[319px] block h-[20px] w-[36px] rounded-[100px] bg-[#656565]" :style="`top:${102 + i * 36}px`">
          <span class="absolute left-[18px] top-[2px] size-[16px] rounded-full bg-white"></span>
        </button>
      </template>
    </section>
  </ScreenFrame>
</template>

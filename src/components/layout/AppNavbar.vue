<script setup>
// The site nav bar on the Events pages. It is the Vue twin of the React NavBar
// (src/components/NavBar.jsx): same links (src/lib/nav.js), same look (Figma "nav-bar"),
// same mock account. Links to other sections are normal page loads into the React app.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IMG, ROUTES, USER } from '@/data'
import { accountMenu, homeLink, navLinks } from '@/lib/nav'
import { isSignedIn, signOut, subscribe } from '@/lib/session'

const route = useRoute()
const signedIn = ref(isSignedIn())
const unsubscribe = subscribe(() => (signedIn.value = isSignedIn()))

const menuOpen = ref(false)
const menu = ref(null)
const closeOnOutside = (e) => { if (menu.value && !menu.value.contains(e.target)) menuOpen.value = false }
const closeOnEscape = (e) => { if (e.key === 'Escape') menuOpen.value = false }
onMounted(() => {
  document.addEventListener('mousedown', closeOnOutside)
  document.addEventListener('keydown', closeOnEscape)
})
onBeforeUnmount(() => {
  unsubscribe()
  document.removeEventListener('mousedown', closeOnOutside)
  document.removeEventListener('keydown', closeOnEscape)
})
watch(() => route.fullPath, () => (menuOpen.value = false))

function logOut() {
  signOut()
  window.location.assign(ROUTES.discover)
}
</script>

<template>
  <header class="site-nav">
    <a :href="homeLink(signedIn)" class="site-nav__brand" aria-label="LittleRedMusic home">
      <img :src="IMG.brand" alt="" width="40" height="40" />
    </a>

    <nav class="site-nav__links" aria-label="Main">
      <a
        v-for="l in navLinks(signedIn)"
        :key="l.key"
        :href="l.to"
        :class="{ 'is-active': l.key === 'events' }"
        :aria-current="l.key === 'events' ? 'page' : undefined"
      >{{ l.label }}</a>
    </nav>

    <div class="site-nav__right">
      <template v-if="signedIn">
        <div ref="menu" class="site-nav__account">
          <a :href="ROUTES.messages" class="site-nav__bell" aria-label="Messages (2 unread)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6a.5.5 0 0 1-.8-.4V16h0A2.5 2.5 0 0 1 4 13.5z" /></svg>
            <span class="site-nav__dot"></span>
          </a>
          <a :href="ROUTES.notifications" class="site-nav__bell" aria-label="Notifications (3 unread)">
            <img src="/assets/icons/bell.svg" alt="" width="24" height="24" />
            <span class="site-nav__dot"></span>
          </a>
          <button type="button" class="site-nav__user" aria-haspopup="menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
            <span class="site-nav__avatar">{{ USER.initials }}</span>
            <span class="site-nav__name">{{ USER.name }}</span>
          </button>
          <div v-if="menuOpen" role="menu" class="site-nav__menu">
            <p class="site-nav__email">{{ USER.email }}</p>
            <a v-for="m in accountMenu" :key="m.to" role="menuitem" :href="m.to" class="site-nav__item">{{ m.label }}</a>
            <div class="site-nav__sep"></div>
            <button type="button" role="menuitem" class="site-nav__item" @click="logOut">Log out</button>
          </div>
        </div>
      </template>
      <div v-else class="site-nav__guest">
        <a :href="ROUTES.signup" class="site-nav__pill">Sign up</a>
        <a :href="ROUTES.login" class="site-nav__pill">Log in</a>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Matches NavBar.jsx exactly; written as plain CSS because the Events pages use Bootstrap. */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 1030;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 72px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.site-nav a { text-decoration: none; }
.site-nav__brand { justify-self: start; display: block; width: 40px; height: 40px; }
.site-nav__brand img { width: 100%; height: 100%; object-fit: contain; vertical-align: top; }

.site-nav__links {
  display: flex;
  align-items: center;
  gap: 24px;
  white-space: nowrap;
  font-family: 'SF Pro Text', 'SF Pro', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
}
.site-nav__links a { color: #6b7280; transition: color 0.15s; }
.site-nav__links a:hover, .site-nav__links a.is-active { color: #111827; }

.site-nav__right { justify-self: end; }
.site-nav__account { position: relative; display: flex; align-items: center; gap: 12px; }
.site-nav__bell { position: relative; display: flex; align-items: center; width: 24px; height: 24px; }
.site-nav__bell img { vertical-align: top; }
.site-nav__dot {
  position: absolute; right: 1px; top: 1px; width: 7px; height: 7px; border-radius: 50%;
  background: #e23b2e; box-shadow: 0 0 0 2px #fff;
}
.site-nav__user { display: flex; align-items: center; gap: 12px; padding: 0; border: 0; background: none; cursor: pointer; }
.site-nav__avatar {
  display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 18px;
  background: #e5e7eb; color: #111827; font-family: 'SF Pro Text', -apple-system, 'Inter', sans-serif; font-size: 13px; font-weight: 700;
}
.site-nav__name { white-space: nowrap; color: #1a1a1a; font-size: 13px; font-weight: 500; }

.site-nav__menu {
  position: absolute; right: 0; top: 48px; width: 210px; padding: 6px 0; overflow: hidden;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: site-nav-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes site-nav-pop { from { opacity: 0; transform: translateY(6px) scale(0.9); } to { opacity: 1; transform: none; } }
.site-nav__email { margin: 0; padding: 4px 14px 6px; color: #888; font-size: 11px; }
.site-nav__item {
  display: block; width: 100%; padding: 9px 14px; border: 0; background: none; text-align: left;
  color: #1a1a1a; font-size: 13px; line-height: normal; cursor: pointer;
}
.site-nav__item:hover { background: #f4f4f5; color: #1a1a1a; }
.site-nav__sep { height: 1px; margin: 6px 0; background: #eee; }

.site-nav__guest { display: flex; align-items: center; gap: 10px; }
.site-nav__pill {
  display: flex; align-items: center; justify-content: center; width: 84px; height: 36px; border-radius: 18px;
  background: #1a1a1a; color: #fff; font-size: 13px; font-weight: 600;
}
.site-nav__pill:hover { background: #000; color: #fff; }
</style>

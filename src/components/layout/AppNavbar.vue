<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { ROUTES } from '@/data'

const route = useRoute()
const { user: currentUser } = useCurrentUser()
const user = currentUser.value

// The other sections are separate pages of the site, so these are plain links.
const links = [
  { label: 'Discover', href: ROUTES.forYou, section: 'discover' },
  { label: 'Events', href: ROUTES.eventsMap, section: 'events' },
  { label: 'Artists', href: ROUTES.artist, section: 'artists' },
  { label: 'Forum', href: ROUTES.thread, section: 'forum' },
]

const activeSection = computed(() => route.meta.section)

const menuOpen = ref(false)

// Whenever the page changes, close the menu
watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>

<template>
  <header class="lrm-nav">
    <!-- Decorative waves behind the bar -->
    <svg class="lrm-nav__waves" viewBox="0 0 1600 80" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="nav-wave-a" x1="0" x2="1">
          <stop offset="0" stop-color="#fbd1e6" />
          <stop offset="0.5" stop-color="#d9d3fb" />
          <stop offset="1" stop-color="#cfe4fb" />
        </linearGradient>
        <linearGradient id="nav-wave-b" x1="0" x2="1">
          <stop offset="0" stop-color="#cfe9fb" />
          <stop offset="0.6" stop-color="#bff0dc" />
          <stop offset="1" stop-color="#fde4d3" />
        </linearGradient>
      </defs>
      <path d="M0 80 V40 C80 30 120 6 220 10 C320 14 360 54 460 50 C560 46 560 70 640 80 Z" fill="url(#nav-wave-a)" opacity="0.8" />
      <path d="M980 80 C1060 70 1100 20 1200 18 C1300 16 1330 52 1420 46 C1500 40 1560 22 1600 30 V80 Z" fill="url(#nav-wave-b)" opacity="0.85" />
    </svg>

    <div class="lrm-nav__inner container-xxl">
      <a :href="ROUTES.forYou" class="lrm-nav__brand" aria-label="LittleRedMusic home">
        <img src="/assets/img/brand.png" alt="" width="40" height="40" class="lrm-nav__logo-img" />
      </a>

      <nav class="lrm-nav__links" :class="{ 'is-open': menuOpen }" aria-label="Main">
        <a
          v-for="link in links"
          :key="link.section"
          :href="link.href"
          class="lrm-nav__link"
          :class="{ 'is-active': activeSection === link.section }"
          :aria-current="activeSection === link.section ? 'page' : undefined"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="lrm-nav__right">
        <a :href="ROUTES.notifications" class="lrm-nav__icon-btn" aria-label="Notifications">
          <i class="bi bi-bell"></i>
        </a>

        <button class="lrm-nav__user" type="button" :aria-label="`Signed in as ${user.name}`">
          <span class="lrm-nav__avatar">{{ user.initials }}</span>
          <span class="lrm-nav__name d-none d-md-inline">{{ user.name }}</span>
        </button>

        <button
          class="lrm-nav__burger d-xl-none"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="Toggle navigation"
          @click="menuOpen = !menuOpen"
        >
          <i class="bi" :class="menuOpen ? 'bi-x-lg' : 'bi-list'"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.lrm-nav {
  position: sticky;
  top: 0;
  z-index: 1030;
  height: var(--navbar-height);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--lrm-border);
  overflow: visible;
}

.lrm-nav__waves {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.lrm-nav__inner {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.lrm-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--lrm-ink);
  text-decoration: none;
}

.lrm-nav__logo-img {
  mix-blend-mode: multiply;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.lrm-nav__logo-unused {
  font-size: 1.9rem;
  background: linear-gradient(135deg, #ff4d8d 0%, #7c4dff 100%);
  -webkit-background-clip: text;  /* cuts that background to the shape of the text (here, the icon glyph) */
  background-clip: text;
  color: transparent;
}

.lrm-nav__links {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2.25rem;
}

.lrm-nav__link {
  position: relative;
  padding: 0.5rem 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--lrm-muted);
  text-decoration: none;
  transition: color 0.15s;
}
.lrm-nav__link:hover {
  color: var(--lrm-ink);
}
.lrm-nav__link.is-active {
  color: var(--lrm-ink);
  font-weight: 700;
}
.lrm-nav__link.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--lrm-coral), var(--lrm-coral-soft));
}

.lrm-nav__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.lrm-nav__icon-btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  color: var(--lrm-ink);
  font-size: 1.15rem;
}
.lrm-nav__icon-btn:hover {
  background: #eef1fb;
}

.lrm-nav__user {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border: 0;
  background: transparent;
  padding: 0;
  font-weight: 700;
  color: var(--lrm-ink);
}

.lrm-nav__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #ffc9dc;
  color: #1b1b3a;
  font-weight: 800;
}

.lrm-nav__burger {
  border: 0;
  background: transparent;
  font-size: 1.6rem;
  color: var(--lrm-ink);
}

@media (max-width: 1199.98px) {
  .lrm-nav__right {
    gap: 0.25rem;
  }
  .lrm-nav__links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    transform: none;
    flex-direction: column;
    gap: 0;
    padding: 0.5rem 1.25rem 1rem;
    background: #fff;
    border-bottom: 1px solid var(--lrm-border);
    box-shadow: var(--lrm-shadow);
    display: none;
  }
  .lrm-nav__links.is-open {
    display: flex;
  }
  .lrm-nav__link {
    padding: 0.8rem 0;
  }
  .lrm-nav__link.is-active::after {
    bottom: 4px;
    right: auto;
    width: 32px;
  }
}

@media (max-width: 575.98px) {
  .lrm-nav__inner {
    gap: 0.5rem;
  }
  .lrm-nav__brand {
    font-size: 1.5rem;
  }
  .lrm-nav__icon-btn,
  .lrm-nav__avatar {
    width: 36px;
    height: 36px;
  }
}
</style>

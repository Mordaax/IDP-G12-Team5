import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '@/data'

// Every screen of the prototype lives in this one Vue app. Screens are lazy-loaded, so a page
// only downloads the CSS it needs: the Events screens bring Bootstrap, the fixed-canvas Figma
// screens bring screens.css, and neither stylesheet leaks into the other.
const screen = (name) => () => import(`../views/${name}.vue`)

const routes = [
  { path: '/', component: screen('IndexView'), meta: { title: 'Hi Fi screens' } },

  // ---- Figma screens --------------------------------------------------------
  { path: ROUTES.discover, component: screen('DiscoverView'), meta: { title: 'Discover' } },
  { path: ROUTES.discoverElectronic, component: screen('DiscoverElectronicView'), meta: { title: 'Discover · Electronic' } },
  { path: ROUTES.signup, component: screen('SignupView'), meta: { title: 'Sign up' } },
  { path: ROUTES.signupFilled, component: screen('SignupView'), props: { filled: true }, meta: { title: 'Sign up' } },
  { path: ROUTES.onboarding, component: screen('OnboardingView'), meta: { title: 'Build your taste profile' } },
  { path: ROUTES.onboardingSpotify, component: screen('OnboardingSpotifyView'), meta: { title: 'Build your taste profile' } },
  { path: ROUTES.onboardingManual, component: screen('OnboardingManualView'), meta: { title: 'Your taste profile' } },
  { path: ROUTES.forYou, component: screen('ForYouView'), meta: { title: 'Discover · For you' } },
  { path: ROUTES.recommended, component: screen('RecommendedView'), meta: { title: 'Discover · Recommended' } },
  { path: ROUTES.artistWidget, component: screen('ArtistWidgetView'), meta: { title: 'Discover · FallingIslands' } },
  { path: ROUTES.artist, component: screen('ArtistView'), props: { tab: 'portfolio' }, meta: { title: 'FallingIslands' } },
  { path: ROUTES.artistEvents, component: screen('ArtistView'), props: { tab: 'events' }, meta: { title: 'FallingIslands · Upcoming events' } },
  { path: ROUTES.thread, component: screen('ForumThreadView'), props: { state: 'browse' }, meta: { title: 'BattleBox 2026 · Forum' } },
  { path: ROUTES.threadTyping, component: screen('ForumThreadView'), props: { state: 'typing' }, meta: { title: 'BattleBox 2026 · Forum' } },
  { path: ROUTES.threadReplied, component: screen('ForumThreadView'), props: { state: 'replied' }, meta: { title: 'BattleBox 2026 · Forum' } },
  { path: ROUTES.notifications, component: screen('NotificationsView'), meta: { title: 'Notifications' } },
  { path: ROUTES.thanks, component: screen('ThanksView'), meta: { title: 'Thank you' } },

  // ---- Events (Vue + Bootstrap) ----------------------------------------------
  {
    path: '/events',
    component: () => import('../layouts/EventsLayout.vue'),
    children: [
      { path: '', redirect: { name: 'events-map' } },
      { path: 'map', name: 'events-map', component: () => import('../features/events/views/EventsMapView.vue'), meta: { title: 'Events', section: 'events' } },
      { path: 'list', name: 'events-list', component: () => import('../features/events/views/EventsListView.vue'), meta: { title: 'Events', section: 'events' } },
      // Short link used by the rest of the site (the FallingIslands / BattleBox demo event).
      { path: 'battlebox', redirect: '/events/fallingislands-battlebox' },
      { path: ':id', name: 'event-detail', component: () => import('../features/events/views/EventDetailView.vue'), props: true, meta: { title: 'Event', section: 'events' } },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · LittleRedMusic` : 'LittleRedMusic'
})

export default router

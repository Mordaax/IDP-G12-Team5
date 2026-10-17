import { createRouter, createWebHistory } from 'vue-router'

// Routes of the Events section (Vue). Anyone can browse Events; saving, commenting and voting
// ask guests to log in (requireLogin in src/lib/session.js). Any other address belongs to the
// React app, so the router hands it over with a normal page load.
const EventDetailView = () => import('../features/events/views/EventDetailView.vue')

const routes = [
  {
    path: '/events',
    component: () => import('../layouts/EventsLayout.vue'),
    children: [
      { path: '', redirect: { name: 'events-map' } },
      { path: 'map', name: 'events-map', component: () => import('../features/events/views/EventsMapView.vue'), meta: { title: 'Events', section: 'events' } },
      { path: 'map/search', redirect: { name: 'events-map' } },
      { path: 'list', name: 'events-list', component: () => import('../features/events/views/EventsListView.vue'), meta: { title: 'Events', section: 'events' } },
      // Short links used by the rest of the site (the FallingIslands / BattleBox demo event).
      { path: 'battlebox', redirect: '/events/fallingislands-battlebox' },
      { path: 'battlebox/forum', redirect: '/events/fallingislands-battlebox/discussions' },
      { path: ':id', name: 'event-detail', component: EventDetailView, props: true, meta: { title: 'Event', section: 'events' } },
      { path: ':id/discussions', name: 'event-discussions', component: EventDetailView, props: (route) => ({ id: route.params.id, initialTab: 'discussions' }), meta: { title: 'Event', section: 'events' } },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: { render: () => null },
    beforeEnter: (to) => {
      window.location.assign(to.fullPath)
      return false
    },
  },
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

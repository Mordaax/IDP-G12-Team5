// The site navigation, used by the shared NavBar on every route.
import { ROUTES } from '@/data'

export const navLinks = (signedIn) => [
  { key: 'discover', label: 'Discover', to: signedIn ? ROUTES.forYou : ROUTES.discover },
  { key: 'events', label: 'Events', to: ROUTES.eventsMap },
  { key: 'artists', label: 'Artists', to: '/artists' },
  { key: 'forum', label: 'Forum', to: '/forum' },
]

export const homeLink = (signedIn) => (signedIn ? ROUTES.forYou : ROUTES.discover)

export const accountMenu = [
  { label: 'Your profile', to: ROUTES.profile },
  { label: 'Edit taste profile', to: ROUTES.onboardingManual },
  { label: 'Settings', to: '/settings' },
]

// The site navigation, shared by the React NavBar and the Vue Events nav so both stay identical.
import { ROUTES } from '@/data'

export const navLinks = (signedIn) => [
  { key: 'discover', label: 'Discover', to: signedIn ? ROUTES.forYou : ROUTES.discover },
  { key: 'events', label: 'Events', to: ROUTES.eventsMap },
  { key: 'artists', label: 'Artists', to: ROUTES.artist },
  { key: 'forum', label: 'Forum', to: ROUTES.thread },
]

export const homeLink = (signedIn) => (signedIn ? ROUTES.forYou : ROUTES.discover)

export const accountMenu = [
  { label: 'Your profile', to: ROUTES.profile },
  { label: 'Messages', to: ROUTES.messages },
  { label: 'Your web of artists', to: ROUTES.forYou },
  { label: 'Edit taste profile', to: ROUTES.onboardingManual },
  { label: 'Notifications', to: ROUTES.notifications },
]

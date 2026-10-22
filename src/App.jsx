import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from './data'
import { isSignedIn, loginUrl, needsAccount } from './lib/session'
import Overview from './pages/Overview'
import Discover from './pages/Discover'
import DiscoverElectronic from './pages/DiscoverElectronic'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import OnboardingSpotify from './pages/OnboardingSpotify'
import OnboardingManual from './pages/OnboardingManual'
import ForYou from './pages/ForYou'
import Recommended from './pages/Recommended'
import ArtistWidget from './pages/ArtistWidget'
import ArtistPage from './pages/ArtistPage'
import Thread from './pages/Thread'
import { ForumTopicRoute } from './pages/Thread'
import Forum, { NewForumTopic } from './pages/Forum'
import Notifications from './pages/Notifications'
import Thanks from './pages/Thanks'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import StyleGuide from './pages/StyleGuide'
import { EventsProvider } from './features/events/react/EventsContext'
import { setViewportFit } from './lib/viewport'
import './features/events/react/events.css'

const EventsMap = lazy(() => import('./features/events/react/EventsBrowse').then((module) => ({ default: module.EventsMap })))
const EventsList = lazy(() => import('./features/events/react/EventsBrowse').then((module) => ({ default: module.EventsList })))
const EventDetail = lazy(() => import('./features/events/react/EventDetail'))

function EventsRoot() {
  useEffect(() => { setViewportFit(false); return () => setViewportFit(true) }, [])
  return <EventsProvider><Suspense fallback={<div role="status" className="p-8">Loading events…</div>}><Outlet /></Suspense></EventsProvider>
}

const TITLES = {
  '/': 'All pages', '/style-guide': 'Style guide',
  '/events/map': 'Events · Map', '/events/list': 'Events · List', '/forum': 'Forum',
  [ROUTES.discover]: 'Discover', [ROUTES.discoverElectronic]: 'Discover · Electronic',
  [ROUTES.signup]: 'Sign up', [ROUTES.signupFilled]: 'Sign up', [ROUTES.login]: 'Log in',
  [ROUTES.onboarding]: 'Build your taste profile', [ROUTES.onboardingSpotify]: 'Build your taste profile',
  [ROUTES.onboardingManual]: 'Your taste profile', [ROUTES.forYou]: 'Discover · For you',
  [ROUTES.recommended]: 'Discover · Recommended', [ROUTES.artistWidget]: 'Discover · FallingIslands',
  [ROUTES.artist]: 'FallingIslands', [ROUTES.artistEvents]: 'FallingIslands · Upcoming events',
  [ROUTES.artistPast]: 'FallingIslands · Past events',
  [ROUTES.thread]: 'BattleBox 2026 · Forum', [ROUTES.threadTyping]: 'BattleBox 2026 · Forum',
  [ROUTES.threadReplied]: 'BattleBox 2026 · Forum', [ROUTES.notifications]: 'Notifications',
  [ROUTES.thanks]: 'Thank you', [ROUTES.profile]: 'Kit Tan', [ROUTES.messages]: 'Messages',
}

// Signed-out pages that a signed-in Kit skips straight past.
const GUEST_ONLY = [ROUTES.discover, ROUTES.discoverElectronic, ROUTES.signup, ROUTES.signupFilled, ROUTES.login]

// On every page change: scroll to the top, set the tab title, and send you to the right
// page for your sign-in state (members-only pages ask you to log in first).
function RouteEffects() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  // Checked on page changes only (reading the sign-in state at that moment): Log in / Log out
  // change the session and move to the next page in one go, and must not be redirected mid-way.
  useEffect(() => {
    const signedIn = isSignedIn()
    if (!signedIn && needsAccount(pathname)) navigate(loginUrl(pathname + search), { replace: true })
    else if (signedIn && GUEST_ONLY.includes(pathname)) navigate(ROUTES.forYou, { replace: true })
  }, [pathname, search, navigate])
  useEffect(() => {
    window.scrollTo(0, 0)
    const t = TITLES[pathname] || (pathname.startsWith('/events/') ? 'Event' : pathname.startsWith('/forum/') ? 'Forum' : '')
    document.title = t ? `${t} · LittleRedMusic` : 'LittleRedMusic'
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        {/* the map of every page, laid out like the Figma canvas */}
        <Route path="/" element={<Overview />} />
        <Route path={ROUTES.screens} element={<Navigate to="/" replace />} />
        <Route path="/style-guide" element={<StyleGuide />} />

        <Route path={ROUTES.discover} element={<Discover />} />
        <Route path={ROUTES.discoverElectronic} element={<DiscoverElectronic />} />
        <Route path={ROUTES.signup} element={<Auth mode="signup" />} />
        <Route path={ROUTES.signupFilled} element={<Auth mode="signup" prefilled />} />
        <Route path={ROUTES.login} element={<Auth mode="login" />} />

        <Route path={ROUTES.onboarding} element={<Onboarding />} />
        <Route path={ROUTES.onboardingSpotify} element={<OnboardingSpotify />} />
        <Route path={ROUTES.onboardingManual} element={<OnboardingManual />} />

        <Route path={ROUTES.forYou} element={<ForYou />} />
        <Route path={ROUTES.recommended} element={<Recommended />} />
        <Route path={ROUTES.artistWidget} element={<ArtistWidget />} />

        <Route path={ROUTES.artist} element={<ArtistPage tab="portfolio" />} />
        <Route path={ROUTES.artistEvents} element={<ArtistPage tab="events" />} />
        <Route path={ROUTES.artistPast} element={<ArtistPage tab="past" />} />

        <Route path="/events" element={<EventsRoot />}>
          {/* A/B test 1, variant B: the Events page opens on the list (variant A opens on the map) */}
          <Route index element={<Navigate to="/events/list" replace />} />
          <Route path="map" element={<EventsMap />} />
          <Route path="map/search" element={<Navigate to="/events/map" replace />} />
          <Route path="list" element={<EventsList />} />
          <Route path="battlebox" element={<Navigate to={ROUTES.event} replace />} />
          <Route path="battlebox/forum" element={<Navigate to={ROUTES.eventForum} replace />} />
          <Route path=":id" element={<EventDetail />} />
          <Route path=":id/discussions" element={<EventDetail />} />
        </Route>

        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/events" element={<Forum category="events" />} />
        <Route path="/forum/artists" element={<Forum category="artists" />} />
        <Route path="/forum/gear" element={<Forum category="gear" />} />
        <Route path="/forum/saved" element={<Forum category="saved" />} />
        <Route path="/forum/new" element={<NewForumTopic />} />
        <Route path="/forum/topics/:topicId" element={<ForumTopicRoute />} />
        <Route path={ROUTES.thread} element={<Thread state="browse" />} />
        <Route path={ROUTES.threadTyping} element={<Thread state="typing" />} />
        <Route path={ROUTES.threadReplied} element={<Thread state="replied" />} />
        <Route path={ROUTES.notifications} element={<Notifications />} />
        <Route path={ROUTES.thanks} element={<Thanks />} />
        <Route path={ROUTES.profile} element={<Profile />} />
        <Route path={ROUTES.messages} element={<Messages />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

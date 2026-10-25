// Mock sign-in, shared by every page (plain JS, no framework).
// There is one account, Kit Tan (db.json → "user"). Signing up or logging in stores
// "signed in" in the browser; Log out clears it. No real authentication happens.
import { USER } from '@/data'
import { communityDemo } from './communityDemo'

const KEY = 'lrm.session'
const listeners = new Set()

function read() {
  try {
    return localStorage.getItem(KEY) === USER.id
  } catch {
    return false
  }
}

let signedIn = read()

function set(value) {
  signedIn = value
  try {
    if (value) localStorage.setItem(KEY, USER.id)
    else localStorage.removeItem(KEY)
  } catch {
    /* private mode: remember for this page only */
  }
  listeners.forEach((l) => l())
}

// keep other tabs in step
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      signedIn = read()
      listeners.forEach((l) => l())
    }
  })
}

export const isSignedIn = () => signedIn
export const signIn = () => set(true)
export const signOut = () => set(false)
export const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Pages that need an account. Visiting one signed out goes to Log in, then back here.
// Events, artist pages and the forum can be read by anyone; doing something there
// (commenting, saving, voting, following …) asks you to log in first — see requireLogin().
const MEMBERS_ONLY = ['/discover/for-you', '/discover/recommended', '/discover/artist', '/onboarding', '/notifications', '/settings', '/profile', '/messages']
export const needsAccount = (path) => MEMBERS_ONLY.some((p) => path === p || path.startsWith(`${p}/`))

/** Where Log in should send you back to afterwards. */
export const loginUrl = (next) => `/login?next=${encodeURIComponent(next)}`

/** The current address, for coming back after Log in. */
export const here = () => window.location.pathname + window.location.search

/**
 * Run `action` if you're signed in; otherwise go to Log in (and come back here afterwards).
 * `go` lets callers navigate without a page reload.
 */
export function requireLogin(action, go = (to) => window.location.assign(to)) {
  if (signedIn) return action?.()
  go(loginUrl(here()))
}

// Demo progress survives navigation and resets when the application reloads.
const demoValues = new Map()
export function sessionGet(key, fallback) {
  return demoValues.has(key) ? demoValues.get(key) : fallback
}
export function sessionSet(key, value) {
  demoValues.set(key, value)
}

// One shared source for the featured artist save, profile activity and unread dots.
export function createArtistProfileState(read = sessionGet, write = sessionSet) {
  const savedKey = 'artist.fallingislands.saved'
  const activityKey = 'profile.artist-save.activity'
  const unreadKey = 'profile.artist-save.unread'
  const saved = read(savedKey, false) === true
  let state = { saved, hasActivity: read(activityKey, saved) === true, unread: saved && read(unreadKey, true) === true }
  const subscribers = new Set()
  const update = (next) => {
    state = next
    for (const [key, value] of [[savedKey, state.saved], [activityKey, state.hasActivity], [unreadKey, state.unread]]) {
      try { write(key, value) } catch { /* Keep working in memory if storage is blocked. */ }
    }
    subscribers.forEach(listener => listener())
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener) => { subscribers.add(listener); return () => subscribers.delete(listener) },
    setSaved: (saved) => {
      if (saved === state.saved) return
      update({ saved, hasActivity: state.hasActivity || saved, unread: saved })
    },
    markSeen: () => { if (state.unread) update({ ...state, unread: false }) },
  }
}

export const artistProfileState = createArtistProfileState()
artistProfileState.subscribe(() => communityDemo.setArtistSaved(artistProfileState.getSnapshot().saved))

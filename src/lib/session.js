// Mock sign-in, shared by the React pages and the Vue Events pages (plain JS, no framework).
// There is one account, Kit Tan (db.json → "user"). Signing up or logging in stores
// "signed in" in the browser; Log out clears it. No real authentication happens.
import { USER } from '@/data'

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
const MEMBERS_ONLY = ['/discover/for-you', '/discover/recommended', '/discover/artist', '/onboarding', '/notifications', '/profile', '/messages']
export const needsAccount = (path) => MEMBERS_ONLY.some((p) => path === p || path.startsWith(`${p}/`))

/** Where Log in should send you back to afterwards. */
export const loginUrl = (next) => `/login?next=${encodeURIComponent(next)}`

/** The current address, for coming back after Log in. */
export const here = () => window.location.pathname + window.location.search

/**
 * Run `action` if you're signed in; otherwise go to Log in (and come back here afterwards).
 * `go` lets the React app navigate without a page reload; Vue pages leave it out.
 */
export function requireLogin(action, go = (to) => window.location.assign(to)) {
  if (signedIn) return action?.()
  go(loginUrl(here()))
}

// ---- things that only last for this browser session (closing the browser clears them) ----
// Used for the comments, votes and messages you post: the site has no backend.
export function sessionGet(key, fallback) {
  try {
    const raw = sessionStorage.getItem(`lrm.${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
export function sessionSet(key, value) {
  try {
    sessionStorage.setItem(`lrm.${key}`, JSON.stringify(value))
  } catch {
    /* storage full / blocked: keep it on this page only */
  }
}

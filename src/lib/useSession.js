import { useState, useSyncExternalStore } from 'react'
import { useGo } from '@/components/AppLink'
import { isSignedIn, requireLogin, sessionGet, sessionSet, signIn, signOut, subscribe } from './session'

/** React view of the mock sign-in: { signedIn, signIn, signOut, requireLogin }. */
export function useSession() {
  const signedIn = useSyncExternalStore(subscribe, isSignedIn, isSignedIn)
  const go = useGo()
  return { signedIn, signIn, signOut, requireLogin: (action) => requireLogin(action, go) }
}

/** Demo state survives navigation and resets on application reload. */
export function useSessionState(key, initial) {
  const [value, setValue] = useState(() => sessionGet(key, typeof initial === 'function' ? initial() : initial))
  const set = (next) =>
    setValue((prev) => {
      const v = typeof next === 'function' ? next(prev) : next
      sessionSet(key, v)
      return v
    })
  return [value, set]
}

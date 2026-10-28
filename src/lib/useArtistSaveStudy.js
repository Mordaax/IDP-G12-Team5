import { useSyncExternalStore } from 'react'
import posthog from './posthog'
import { ARTIST_SAVE_FLAG, createArtistSaveStudy, validSaveVariant } from './artistSaveStudy'
import { artistProfileState } from './session'

const browser = typeof window !== 'undefined'
const requested = browser ? new URLSearchParams(window.location.search).get('save_artist_variant') : null
const preview = browser && import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(window.location.hostname) && validSaveVariant(requested) ? requested : null
const key = import.meta.env.VITE_POSTHOG_KEY
const client = browser && key && !preview ? posthog : null

let storage
try { storage = browser ? window.localStorage : null } catch { /* Storage can be unavailable. */ }
export const artistSaveStudy = createArtistSaveStudy({ client, storage, preview })
if (!preview) {
  if (artistSaveStudy.getSnapshot().savedIds.includes('dj-beatroot')) artistProfileState.setSaved(true)
  const syncFeatured = () => artistSaveStudy.setSaved('dj-beatroot', artistProfileState.getSnapshot().saved, { track: false })
  syncFeatured()
  artistProfileState.subscribe(syncFeatured)
}
if (client) {
  const assign = () => artistSaveStudy.assign(client.getFeatureFlag(ARTIST_SAVE_FLAG, { send_event: false }))
  client.onFeatureFlags(assign)
  // A failed flags request must never prevent people saving artists.
  setTimeout(() => { if (!artistSaveStudy.getSnapshot().ready) artistSaveStudy.assign(null) }, 8000)
}
export function useArtistSaveStudy() {
  return { ...useSyncExternalStore(artistSaveStudy.subscribe, artistSaveStudy.getSnapshot, artistSaveStudy.getSnapshot), study: artistSaveStudy }
}

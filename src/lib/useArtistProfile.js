import { useSyncExternalStore } from 'react'
import { artistProfileState } from './session'

export function useArtistProfile() {
  const state = useSyncExternalStore(artistProfileState.subscribe, artistProfileState.getSnapshot, artistProfileState.getSnapshot)
  return { ...state, setSaved: artistProfileState.setSaved, markSeen: artistProfileState.markSeen }
}

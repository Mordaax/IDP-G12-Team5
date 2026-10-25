import { useSyncExternalStore } from 'react'
import { communityDemo } from './communityDemo'

export function useCommunityDemo() {
  return useSyncExternalStore(communityDemo.subscribe, communityDemo.getSnapshot, communityDemo.getSnapshot)
}

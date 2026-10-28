import { useEffect, useState } from 'react'
import posthog from './posthog'

export function useVariant(flagKey) {
  const [variant, setVariant] = useState(() => posthog.getFeatureFlag(flagKey))

  useEffect(() => posthog.onFeatureFlags(() => {
    setVariant(posthog.getFeatureFlag(flagKey))
  }), [flagKey])

  return variant
}

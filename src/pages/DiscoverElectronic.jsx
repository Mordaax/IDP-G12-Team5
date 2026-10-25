// 📸 2 Discover (electronic music subgenres) — Figma 1431:715.
// Recentre goes back out to the whole web of dots.
import { Page } from '@/components/Layout'
import SignedOutMap from '@/components/discover/SignedOutMap'
import { WEB } from '@/components/discover/graphs'
import { ROUTES } from '@/data'

export default function DiscoverElectronic() {
  return (
    <Page>
      <SignedOutMap label="Electronic subgenres" graph={WEB} initialGenre="electronic" recentreTo={ROUTES.discover} />
    </Page>
  )
}

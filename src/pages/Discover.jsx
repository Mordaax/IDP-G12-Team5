// 📸 1 Discover (web of dots) — Figma 1431:453 — the signed-out landing page.
import { Page } from '@/components/Layout'
import SignedOutMap from '@/components/discover/SignedOutMap'
import { WEB } from '@/components/discover/graphs'

export default function Discover() {
  return (
    <Page>
      <SignedOutMap label="Web of artists" graph={WEB} />
    </Page>
  )
}

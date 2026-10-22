// 📸 9 Discover (artist widget expanded) — Figma 1431:2897 — FallingIslands drawer on the map.
import { useState } from 'react'
import { useGo } from '@/components/AppLink'
import { MapArea, Page } from '@/components/Layout'
import { SubgenreLabels, TasteBar, TasteLabel } from '@/components/discover/Graph'
import { ArtistDrawer, DiscoverMenu, WelcomeGuide, toggleGenreIn } from '@/components/discover/Panels'
import MapButtons from '@/components/discover/MapButtons'
import WebOfDots from '@/components/discover/WebOfDots'
import { FALLINGISLANDS_SPOT, SYNTHWAVE } from '@/components/discover/graphs'
import { ROUTES } from '@/data'
import { useToast } from '@/lib/toast'

const FEATURED = [FALLINGISLANDS_SPOT]

export default function ArtistWidget() {
  const [hidden, setHidden] = useState(() => new Set()) // genres unticked in the left menu
  const [guideOpen, setGuideOpen] = useState(false)
  const go = useGo()
  const toast = useToast()

  return (
    <Page active="discover">
      <MapArea label="Synthwave cluster">
        <WebOfDots
          {...SYNTHWAVE}
          featured={FEATURED}
          signedIn
          reserveBottom={70}
          label="Synthwave cluster"
          isDim={(a) => hidden.has(a.genre)}
          controls={({ zoomIn, zoomOut }) => <MapButtons dark onHelp={() => setGuideOpen((open) => !open)} recentreTo={ROUTES.forYou} onZoomIn={zoomIn} onZoomOut={zoomOut} />}
        >
          <p className="absolute left-[385px] top-[643px] m-0 whitespace-nowrap text-[12px] leading-[1.4] font-medium text-[#8b5cf6]">Pop Music</p>
          <SubgenreLabels />
          <span className="pointer-events-none absolute left-[603px] top-[441px] block h-[29px] w-[30px] rounded-full border-2 border-brand" />
          {/* centred under the dashed ring (centre x 644, bottom 510) */}
          <TasteLabel x={541} y={524} large />
        </WebOfDots>

        <TasteBar />
        <DiscoverMenu hidden={hidden} onToggleGenre={toggleGenreIn(setHidden)} signedIn />

        {guideOpen && <div className="absolute right-[40px] top-[72px] z-20"><WelcomeGuide signedIn onClose={() => setGuideOpen(false)} /></div>}

        {/* Help & tour replaces the artist card while the guide is open */}
        {!guideOpen && (
          <div className="absolute bottom-[132px] right-[40px] top-[72px] z-10 flex items-start">
            <ArtistDrawer onDismiss={() => { toast('Got it — fewer artists like FallingIslands'); go(ROUTES.recommended) }} />
          </div>
        )}
      </MapArea>
    </Page>
  )
}

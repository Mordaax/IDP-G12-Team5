// 📸 8 Discover — Figma 1431:2609 — zoomed into Synthwave, recommendations open.
// Click the ringed dot (FallingIslands) or "Low Tide" to open the artist widget.
import { useState } from 'react'
import { MapArea, Page } from '@/components/Layout'
import { SubgenreLabels, TasteChips, TasteLabel } from '@/components/discover/Graph'
import { DiscoverMenu, RecommendedPanel, toggleGenreIn } from '@/components/discover/Panels'
import MapButtons from '@/components/discover/MapButtons'
import WebOfDots from '@/components/discover/WebOfDots'
import { FALLINGISLANDS_SPOT, SYNTHWAVE } from '@/components/discover/graphs'
import { ROUTES } from '@/data'

const FEATURED = [{ ...FALLINGISLANDS_SPOT, to: ROUTES.artistWidget }]

export default function Recommended() {
  const [hidden, setHidden] = useState(() => new Set()) // genres unticked in the left menu

  return (
    <Page active="discover">
      <MapArea label="Synthwave cluster">
        <WebOfDots
          {...SYNTHWAVE}
          featured={FEATURED}
          signedIn
          label="Synthwave cluster"
          isDim={(a) => hidden.has(a.genre)}
          controls={({ zoomIn, zoomOut }) => <MapButtons dark recentreTo={ROUTES.forYou} onZoomIn={zoomIn} onZoomOut={zoomOut} />}
        >
          <p className="absolute left-[416px] top-[654px] m-0 whitespace-nowrap text-[12px] leading-[1.4] font-medium text-[#8b5cf6]">Pop Music</p>
          <SubgenreLabels />
          <span className="pointer-events-none absolute left-[603px] top-[441px] block h-[29px] w-[30px] rounded-full border-2 border-brand" />
          <TasteChips />
          <TasteLabel x={564} y={533} large />
        </WebOfDots>

        <DiscoverMenu hidden={hidden} onToggleGenre={toggleGenreIn(setHidden)} signedIn />

        <div className="absolute right-[79px] top-[20px] z-10">
          <RecommendedPanel closeTo={ROUTES.forYou} metalDot="#737373" seeAllTo={ROUTES.artistWidget} />
        </div>
      </MapArea>
    </Page>
  )
}

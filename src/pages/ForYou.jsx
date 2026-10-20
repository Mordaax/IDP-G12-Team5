// 📸 7 Discover (for you) — Figma 1431:2324 — signed in, taste profile highlighted.
import { useState } from 'react'
import Link from '@/components/AppLink'
import { MapArea, Page } from '@/components/Layout'
import { TasteChips, TasteLabel } from '@/components/discover/Graph'
import { DiscoverMenu, RecommendedPanel, WelcomeGuide, toggleGenreIn } from '@/components/discover/Panels'
import MapButtons from '@/components/discover/MapButtons'
import WebOfDots from '@/components/discover/WebOfDots'
import { FOR_YOU } from '@/components/discover/graphs'
import { ROUTES } from '@/data'

export default function ForYou() {
  const [hidden, setHidden] = useState(() => new Set()) // genres unticked in the left menu
  const [panelOpen, setPanelOpen] = useState(true)
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <Page active="discover">
      <MapArea label="Your web of artists">
        <WebOfDots
          {...FOR_YOU}
          signedIn
          label="Your web of artists"
          isDim={(a) => hidden.has(a.genre)}
          controls={({ zoomIn, zoomOut, reset }) => (
            <MapButtons dark onHelp={() => setGuideOpen((open) => !open)} onRecentre={() => { reset(); setHidden(new Set()) }} onZoomIn={zoomIn} onZoomOut={zoomOut} />
          )}
        >
          <TasteChips />
          <TasteLabel x={564} y={533} to={ROUTES.recommended} />
          {/* your position on the map */}
          <Link to={ROUTES.recommended} aria-label="Zoom into your taste profile" title="Zoom into your taste profile" className="absolute left-[523px] top-[477px] block h-[18px] w-[19px] rounded-full border-2 border-brand transition-transform hover:scale-125" />
        </WebOfDots>

        <DiscoverMenu hidden={hidden} onToggleGenre={toggleGenreIn(setHidden)} signedIn />

        {guideOpen && <div className="absolute right-[40px] top-[24px] z-20"><WelcomeGuide signedIn onClose={() => setGuideOpen(false)} /></div>}

        {panelOpen ? (
          <div className="absolute right-[79px] top-[92px] z-10">
            <RecommendedPanel onClose={() => setPanelOpen(false)} seeAllTo={ROUTES.recommended} />
          </div>
        ) : (
          <button type="button" onClick={() => setPanelOpen(true)} className="absolute right-[79px] top-[92px] z-10 rounded-[999px] bg-white px-[16px] py-[10px] text-[13px] font-semibold text-ink shadow-[0px_2px_10px_rgba(var(--lrm-raw-rgb-000000),0.2)] ring-1 ring-inset ring-line">
            Recommended for you
          </button>
        )}
      </MapArea>
    </Page>
  )
}

// 📸 7 Discover (for you) — Figma 1431:2324 — signed in, taste profile highlighted.
import { useState } from 'react'
import Link from '@/components/AppLink'
import { MapArea, Page } from '@/components/Layout'
import { TasteBar, TasteLabel } from '@/components/discover/Graph'
import { DiscoverMenu, RecommendedPanel, WelcomeGuide, toggleGenreIn } from '@/components/discover/Panels'
import MapButtons from '@/components/discover/MapButtons'
import WebOfDots from '@/components/discover/WebOfDots'
import { FOR_YOU } from '@/components/discover/graphs'
import { ROUTES } from '@/data'
import { sessionGet, sessionSet } from '@/lib/session'

export default function ForYou() {
  const [hidden, setHidden] = useState(() => new Set()) // genres unticked in the left menu
  // closed from the Recommended screen (or here) stays closed; "Recommended for you" opens it again
  const [panelOpen, setPanelOpen] = useState(() => !sessionGet('discover.recommendationsClosed', false))
  const setPanel = (open) => { sessionSet('discover.recommendationsClosed', !open); setPanelOpen(open) }
  const [guideOpen, setGuideOpen] = useState(false)
  // Opening Help & tour closes the recommendations, so only the guide is on screen
  const toggleGuide = () => { if (!guideOpen) setPanel(false); setGuideOpen(!guideOpen) }

  return (
    <Page active="discover">
      <MapArea label="Your web of artists">
        <WebOfDots
          {...FOR_YOU}
          signedIn
          reserveBottom={70}
          label="Your web of artists"
          isDim={(a) => hidden.has(a.genre)}
          controls={({ zoomIn, zoomOut, reset }) => (
            <MapButtons dark onHelp={toggleGuide} onRecentre={() => { reset(); setHidden(new Set()) }} onZoomIn={zoomIn} onZoomOut={zoomOut} />
          )}
        >
          {/* centred under the dashed ring (centre x 548, bottom 519) */}
          <TasteLabel x={464} y={533} to={ROUTES.recommended} />
          {/* your position on the map */}
          <Link to={ROUTES.recommended} aria-label="Zoom into your taste profile" title="Zoom into your taste profile" className="absolute left-[523px] top-[477px] block h-[18px] w-[19px] rounded-control border-2 border-brand transition-transform hover:scale-125" />
        </WebOfDots>

        <TasteBar />
        <DiscoverMenu hidden={hidden} onToggleGenre={toggleGenreIn(setHidden)} signedIn />

        {guideOpen && <div className="absolute right-[40px] top-[72px] z-20"><WelcomeGuide signedIn onClose={() => setGuideOpen(false)} /></div>}

        {panelOpen ? (
          <div className="absolute bottom-[132px] right-[40px] top-[72px] z-10 flex items-start">
            <RecommendedPanel onClose={() => setPanel(false)} seeAllTo={ROUTES.recommended} />
          </div>
        ) : !guideOpen && (
          <button type="button" onClick={() => setPanel(true)} className="absolute right-[40px] top-[72px] z-10 rounded-control bg-surface px-[16px] py-[10px] text-[13px] font-semibold text-ink shadow-pop ring-1 ring-inset ring-line">
            Recommended for you
          </button>
        )}
      </MapArea>
    </Page>
  )
}

import { useState } from 'react'
import { useGo } from '@/components/AppLink'
import { MapArea } from '@/components/Layout'
import { DiscoverMenu, WelcomeGuide, toggleGenreIn } from './Panels'
import MapButtons from './MapButtons'
import WebOfDots from './WebOfDots'

// Signed-out Discover body (📸 1, 📸 2, and blurred behind the sign-up card on 📸 3–4).
// `graph` is one of the datasets in ./graphs.js; unticking a genre fades its dots.
export default function SignedOutMap({ label, graph, recentreTo, interactive = true }) {
  const [hidden, setHidden] = useState(() => new Set())
  const [guideOpen, setGuideOpen] = useState(true)
  const go = useGo()

  const toggleGenre = toggleGenreIn(setHidden)

  return (
    <MapArea label={label}>
      <WebOfDots
        {...graph}
        label={label}
        isDim={(a) => hidden.has(a.genre)}
        controls={({ zoomIn, zoomOut, reset }) =>
          interactive && (
            <MapButtons
              onHelp={() => setGuideOpen((o) => !o)}
              onRecentre={() => { reset(); setHidden(new Set()); if (recentreTo) go(recentreTo) }}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
            />
          )}
      />

      {interactive && (
        <>
          <DiscoverMenu hidden={hidden} onToggleGenre={toggleGenre} />
          {guideOpen && (
            <div className="absolute right-[40px] top-[24px] z-20">
              <WelcomeGuide onClose={() => setGuideOpen(false)} />
            </div>
          )}
        </>
      )}
    </MapArea>
  )
}

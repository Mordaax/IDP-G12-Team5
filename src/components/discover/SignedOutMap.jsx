import { useEffect, useState } from 'react'
import { useGo } from '@/components/AppLink'
import { MapArea } from '@/components/Layout'
import { DiscoverMenu } from './Panels'
import DiscoverTour, { rememberDiscoverTour, shouldShowDiscoverTour } from './DiscoverTour'
import MapButtons from './MapButtons'
import WebOfDots from './WebOfDots'
import useGenreNavigation from './useGenreNavigation'

// Signed-out Discover body (📸 1, 📸 2, and blurred behind the sign-up card on 📸 3–4).
// `graph` is one of the datasets in ./graphs.js; genre shortcuts move the camera without filtering dots.
export default function SignedOutMap({ label, graph, recentreTo, interactive = true, initialGenre }) {
  const { cameraRef, focusedGenre, setFocusedGenre, navigateGenre } = useGenreNavigation()
  const [guideOpen, setGuideOpen] = useState(() => interactive && !initialGenre && shouldShowDiscoverTour())
  const closeGuide = () => { rememberDiscoverTour(); setGuideOpen(false) }
  const go = useGo()

  useEffect(() => { if (initialGenre) navigateGenre(initialGenre) }, [initialGenre, navigateGenre])

  return (
    <MapArea label={label}>
      <WebOfDots
        {...graph}
        label={label}
        ref={cameraRef}
        onGenreFocusChange={setFocusedGenre}
        controls={({ zoomIn, zoomOut, reset }) =>
          interactive && (
            <MapButtons
              onHelp={() => setGuideOpen((o) => !o)}
              onRecentre={() => { reset(); if (recentreTo) go(recentreTo) }}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
            />
          )}
      />

      {interactive && (
        <>
          <DiscoverMenu focusedGenre={focusedGenre} onNavigateGenre={navigateGenre} tourOpen={guideOpen} />
          {guideOpen && <DiscoverTour cameraRef={cameraRef} onClose={closeGuide} />}
        </>
      )}
    </MapArea>
  )
}

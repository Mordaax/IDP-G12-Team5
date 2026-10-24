// 📸 7 Discover (for you) — Figma 1431:2324 — signed in, taste profile highlighted.
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Link from '@/components/AppLink'
import { MapArea, Page } from '@/components/Layout'
import { DiscoverMenu, RecommendedPanel } from '@/components/discover/Panels'
import DiscoverTour, { rememberDiscoverTour } from '@/components/discover/DiscoverTour'
import MapButtons from '@/components/discover/MapButtons'
import WebOfDots from '@/components/discover/WebOfDots'
import useGenreNavigation from '@/components/discover/useGenreNavigation'
import { FOR_YOU } from '@/components/discover/graphs'
import { ARTISTS, ARTIST_CATALOGUE, GENRE_BY_KEY, ROUTES } from '@/data'
import { loadTasteProfile, preferredGenreIds, preferredSubgenreIds } from '@/lib/tasteProfile'
import { personaliseGraph } from '@/components/discover/personalisedGraph'
import { recommendedSongsFor } from '@/components/discover/recommendations'

export default function ForYou() {
  const [profile] = useState(() => loadTasteProfile())
  const preferred = useMemo(() => preferredGenreIds(profile?.selected ?? [], ARTIST_CATALOGUE), [profile])
  const preferredChildren = useMemo(() => preferredSubgenreIds(profile?.selected ?? [], ARTIST_CATALOGUE), [profile])
  const hasPreferences = preferred.length > 0
  const [params, setParams] = useSearchParams()
  const mode = params.get('view') === 'personalised' ? 'personalised' : 'default'
  const setMode = value => setParams(previous => {
    const next = new URLSearchParams(previous)
    if (value === 'personalised') next.set('view', value)
    else next.delete('view')
    return next
  }, { replace: true })
  const recommendations = useMemo(() => recommendedSongsFor(ARTISTS, preferred, preferredChildren), [preferred, preferredChildren])
  const recommendedIds = useMemo(() => recommendations.map(row => row.artist.id), [recommendations])
  const [activePreview, setActivePreview] = useState(null)
  const onTogglePreview = useCallback(track => setActivePreview(current =>
    current?.artistId === track.artistId && current.title === track.title ? null : track), [])
  const personalised = useMemo(() => personaliseGraph(FOR_YOU, preferred, preferredChildren, ARTIST_CATALOGUE.artists, recommendedIds), [preferred, preferredChildren, recommendedIds])
  const activeGraph = mode === 'personalised' ? personalised : FOR_YOU
  const { cameraRef, focusedGenre, setFocusedGenre, navigateGenre } = useGenreNavigation()
  const [panelOpen, setPanelOpen] = useState(true)
  const [guideOpen, setGuideOpen] = useState(false)
  const closeGuide = () => { rememberDiscoverTour(); setGuideOpen(false) }
  const [editHintOpen, setEditHintOpen] = useState(false)

  return (
    <Page active="discover">
      <MapArea label="Your web of artists">
        <WebOfDots
          {...activeGraph}
          activePreview={activePreview}
          onTogglePreview={onTogglePreview}
          previewRows={recommendations}
          rightInset={panelOpen ? 352 : 24}
          viewKey={mode}
          signedIn
          label="Your web of artists"
          ref={cameraRef}
          onGenreFocusChange={setFocusedGenre}
          controls={({ zoomIn, zoomOut, reset }) => (
            <MapButtons dark onHelp={() => setGuideOpen((open) => !open)} onRecentre={() => { reset() }} onZoomIn={zoomIn} onZoomOut={zoomOut} />
          )}
        />

        <div className="absolute right-[40px] top-[24px] z-20 flex w-[360px] flex-col items-end gap-[6px]">
          <div className="flex items-center gap-[8px]">
            <div role="group" aria-label="Map view" className="flex items-center gap-[4px] rounded-control border border-line bg-soft p-[4px] shadow-panel">
              {[{ value: 'default', text: 'Default map' }, { value: 'personalised', text: 'Personalised map' }].map(({ value, text }) => (
                <button key={value} type="button" aria-pressed={mode === value}
                  disabled={value === 'personalised' && !recommendedIds.length}
                  title={value === 'personalised' && !recommendedIds.length ? 'No recommendations available yet' : undefined}
                  onClick={() => { setGuideOpen(false); setMode(value) }}
                  className={`h-[34px] whitespace-nowrap rounded-control px-[14px] text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45 ${mode === value ? 'bg-brand text-on-accent shadow-pop' : 'text-muted hover:bg-surface hover:text-ink'}`}>
                  {text}
                </button>
              ))}
            </div>
            <div className="relative shrink-0">
              <Link to={ROUTES.onboardingManual} aria-label="Edit taste profile" aria-describedby={editHintOpen ? 'discover-edit-taste-hint' : undefined}
                onMouseEnter={() => setEditHintOpen(true)} onMouseLeave={() => setEditHintOpen(false)}
                onFocus={() => setEditHintOpen(true)} onBlur={() => setEditHintOpen(false)}
                onKeyDown={event => { if (event.key === 'Escape') setEditHintOpen(false) }}
                className="flex size-[44px] items-center justify-center rounded-control border border-line bg-surface text-muted shadow-panel transition-colors hover:bg-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-accent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>
              </Link>
              {editHintOpen && <span id="discover-edit-taste-hint" role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-30 mt-[8px] -translate-x-1/2 whitespace-nowrap rounded-control bg-ink px-[10px] py-[6px] text-[11px] font-medium text-surface shadow-pop">Edit taste profile</span>}
            </div>
          </div>
          {hasPreferences && <div aria-label="Preferred genres" className="flex max-w-full items-center gap-[8px] overflow-hidden rounded-control bg-surface/95 px-[8px] text-[11px] text-muted" title={preferred.map(id => GENRE_BY_KEY[id].name).join(' · ')}>
            {preferred.map(id => <span key={id} className="inline-flex shrink-0 items-center gap-[4px] whitespace-nowrap"><span aria-hidden="true" className="size-[6px] shrink-0 rounded-full" style={{ background: GENRE_BY_KEY[id].dot }} />{GENRE_BY_KEY[id].name}</span>)}
          </div>}
        </div>

        <DiscoverMenu focusedGenre={focusedGenre} onNavigateGenre={navigateGenre} signedIn tourOpen={guideOpen} />

        {guideOpen && <DiscoverTour cameraRef={cameraRef} onClose={closeGuide} signedIn />}

        {panelOpen ? (
          <div className="absolute right-[40px] top-[108px] z-10">
            <RecommendedPanel rows={recommendations} activePreview={activePreview} onTogglePreview={onTogglePreview} onJumpToArtist={id => cameraRef.current?.focusArtist(id)} onClose={() => setPanelOpen(false)} />
          </div>
        ) : (
          <button type="button" onClick={() => setPanelOpen(true)} className="absolute right-[40px] top-[108px] z-10 rounded-control bg-surface px-[16px] py-[10px] text-[13px] font-semibold text-ink shadow-pop ring-1 ring-inset ring-line">
            Recommended for you
          </button>
        )}
      </MapArea>
    </Page>
  )
}

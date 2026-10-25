// 📸 6 Onboarding (connect spotify) — Figma 1431:2082 — taste profile filled in from Spotify
// (or Apple Music). Everything stays editable; the profile bar updates as you pick.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page, Stage } from '@/components/Layout'
import { GenreCard, OnboardingHeader, SongCard, TasteProfile, toggleIn } from '@/components/onboarding/Onboarding'
import { ARTIST_CATALOGUE, ROUTES } from '@/data'
import { loadTasteProfile, saveTasteProfile, toggleTasteSelection } from '@/lib/tasteProfile'

export default function OnboardingSpotify() {
  const [params] = useSearchParams()
  const service = params.get('from') === 'apple' ? 'Apple Music' : 'Spotify'
  const [savedProfile] = useState(loadTasteProfile)
  const [genres, setGenres] = useState(() => savedProfile?.selected ?? ['Pop', 'Electronic / EDM', 'Mandopop', 'House'])
  const [songs, setSongs] = useState(() => savedProfile?.songs ?? ['Tracks of the Woods', 'Slow Burn'])

  return (
    <Page active="discover">
      <div className="h-px w-full bg-divider" />
      <Stage height={827}>
        <OnboardingHeader title="Let’s build your taste profile" subtitle={`Connected to ${service}. We picked these from your listening — change anything you like.`} />

        <GenreCard x={185} y={158} title="Pick your genres" chipStyle="dark" selected={genres} onToggle={value => setGenres(previous => toggleTasteSelection(previous, value, ARTIST_CATALOGUE))} />
        <SongCard x={730} y={157} title="Pick your songs" added={songs} onToggle={toggleIn(setSongs)} />

        <div className="absolute left-[185px] top-[518px] w-[1060px]">
          <TasteProfile selected={genres} />
          <Link to={`${ROUTES.forYou}?view=personalised`} aria-disabled={!genres.length}
            onClick={(event) => {
              if (!genres.length) { event.preventDefault(); return }
              saveTasteProfile({ selected: genres, songs })
            }}
            className={`mx-auto mt-[43px] flex h-[48px] w-[240px] items-center justify-center rounded-control text-[15px] font-semibold ${genres.length ? 'text-on-accent bg-accent hover:bg-accent-hover' : 'pointer-events-none bg-line text-subtle'}`}>
            {'Next  →'}
          </Link>
        </div>
      </Stage>
    </Page>
  )
}

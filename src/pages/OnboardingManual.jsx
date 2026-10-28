// Onboarding (your taste profile — manual) — Figma 1439:278. Also opened from the
// "Edit taste profile" item in the account menu.
import { useState } from 'react'
import Link from '@/components/AppLink'
import { Page, Stage } from '@/components/Layout'
import { GenreCard, OnboardingHeader, SongCard, TasteProfile, toggleIn } from '@/components/onboarding/Onboarding'
import { ARTIST_CATALOGUE, ROUTES } from '@/data'
import { loadTasteProfile, saveTasteProfile, toggleTasteSelection } from '@/lib/tasteProfile'
import { useToast } from '@/lib/toast'

export default function OnboardingManual() {
  const [savedProfile] = useState(loadTasteProfile)
  const [genres, setGenres] = useState(() => savedProfile?.selected ?? ['Electronic / EDM'])
  const [songs, setSongs] = useState(() => savedProfile?.songs ?? [])
  const toast = useToast()
  const toggleSong = value => {
    if (value === 'City To Burn' && !songs.includes(value)) {
      setGenres(previous => previous.includes('Synthwave') ? previous : [...previous, 'Synthwave'])
    }
    toggleIn(setSongs)(value)
  }

  return (
    <Page active="discover">
      <div className="h-px w-full bg-divider" />
      <Stage height={827}>
        <OnboardingHeader title="Your taste profile" subtitle="Choose the genres and songs that feel most like you. You can change these any time." />

        <GenreCard x={190} y={132} title="Your genres from Spotify" chipStyle="bold" selected={genres} onToggle={value => setGenres(previous => toggleTasteSelection(previous, value, ARTIST_CATALOGUE))} />
        <SongCard x={730} y={132} title="Any favourites from your library?" added={songs} onToggle={toggleSong} />

        <div className="absolute left-[190px] top-[493px] w-[1060px]">
          <TasteProfile selected={genres} />
          <div className="mt-[27px] flex justify-center gap-[13px]">
            <Link to={ROUTES.onboarding} className="flex h-[48px] w-[240px] items-center justify-center rounded-control bg-divider text-[15px] font-semibold text-ink hover:bg-line">← Back</Link>
            <Link to={`${ROUTES.forYou}?view=personalised`} onClick={() => { saveTasteProfile({ selected: genres, songs }); toast('Taste profile saved') }} className="flex h-[48px] w-[240px] items-center justify-center rounded-control bg-accent text-[15px] font-semibold text-on-accent hover:bg-accent-hover">{'Save profile  →'}</Link>
          </div>
        </div>
      </Stage>
    </Page>
  )
}

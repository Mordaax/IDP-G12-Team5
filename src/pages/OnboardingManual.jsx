// Onboarding (your taste profile — manual) — Figma 1439:278. Also opened from the
// "Edit taste profile" item in the account menu.
import { useState } from 'react'
import Link from '@/components/AppLink'
import { Page, Stage } from '@/components/Layout'
import { GenreCard, OnboardingHeader, SongCard, TasteProfile, toggleIn } from '@/components/onboarding/Onboarding'
import { ROUTES } from '@/data'
import { loadTasteProfile, saveTasteProfile } from '@/lib/tasteProfile'
import { useToast } from '@/lib/toast'

export default function OnboardingManual() {
  const [savedProfile] = useState(loadTasteProfile)
  const [genres, setGenres] = useState(() => savedProfile?.selected ?? ['Rock & Alternative', 'Electronic / EDM', 'Indie rock', 'House'])
  const [songs, setSongs] = useState(() => savedProfile?.songs ?? ['Tracks of the Woods', 'Slow Burn'])
  const toast = useToast()

  return (
    <Page active="discover">
      <div className="h-px w-full bg-divider" />
      <Stage height={827}>
        <OnboardingHeader title="Your taste profile" subtitle="Choose the genres and songs that feel most like you. You can change these any time." />

        <GenreCard x={190} y={132} title="Your genres" chipStyle="bold" selected={genres} onToggle={toggleIn(setGenres)} />
        <SongCard x={730} y={132} title="Your songs" added={songs} onToggle={toggleIn(setSongs)} />

        <div className="absolute left-[190px] top-[493px] w-[1060px]">
          <TasteProfile selected={genres} />
          <div className="mt-[27px] flex justify-center gap-[13px]">
            <Link to={ROUTES.onboarding} className="flex h-[48px] w-[240px] items-center justify-center rounded-control bg-divider text-[15px] font-semibold text-ink hover:bg-line">← Back</Link>
            <Link to={ROUTES.forYou} onClick={() => { saveTasteProfile({ selected: genres, songs }); toast('Taste profile saved') }} className="flex h-[48px] w-[240px] items-center justify-center rounded-control bg-accent text-[15px] font-semibold text-on-accent hover:bg-accent-hover">{'Save profile  →'}</Link>
          </div>
        </div>
      </Stage>
    </Page>
  )
}

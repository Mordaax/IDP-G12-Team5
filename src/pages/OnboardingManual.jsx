// Onboarding (your taste profile — manual) — Figma 1439:278. Also opened from the
// "Edit taste profile" item in the account menu.
import { useState } from 'react'
import Link from '@/components/AppLink'
import { Page, Stage } from '@/components/Layout'
import { GenreCard, OnboardingHeader, SongCard, orderedPicks, toggleIn } from '@/components/onboarding/Onboarding'
import { ROUTES } from '@/data'
import { useToast } from '@/lib/toast'

export default function OnboardingManual() {
  const [genres, setGenres] = useState(['Indie Rock', 'Electronic', 'Synthwave'])
  const [songs, setSongs] = useState(['Tracks of the Woods', 'Slow Burn'])
  const toast = useToast()

  const summary = [orderedPicks(genres).join(' · '), songs.join(' · ')].filter(Boolean).join('   •   ')

  return (
    <Page active="discover">
      <div className="h-px w-full bg-divider" />
      <Stage height={827}>
        <OnboardingHeader title="Your taste profile" subtitle="Choose the genres and songs that feel most like you. You can change these any time." />

        <GenreCard x={190} y={132} title="Your genres" chipStyle="bold" selected={genres} onToggle={toggleIn(setGenres)} dotOverrides={{ Electronic: '#1f1f1f' }} />
        <SongCard x={730} y={132} title="Your songs" added={songs} onToggle={toggleIn(setSongs)} />

        <div className="absolute left-[190px] top-[493px] h-[72px] w-[1060px] rounded-[12px] border border-line bg-soft">
          <p className="absolute left-[23px] top-[15px] m-0 whitespace-nowrap text-[10px] leading-normal font-semibold text-subtle">YOUR TASTE PROFILE</p>
          <p className="absolute left-[23px] top-[37px] m-0 whitespace-nowrap text-[12px] leading-normal text-muted">Updates as you pick. You can change it any time.</p>
          <p className="absolute left-[415px] top-[25px] m-0 w-[620px] truncate whitespace-pre text-[13px] leading-normal text-subtle">{summary || 'Nothing picked yet.'}</p>
        </div>

        <Link to={ROUTES.onboarding} className="absolute left-[476px] top-[592px] flex h-[48px] w-[240px] items-center justify-center rounded-[24px] bg-divider text-[15px] font-semibold text-black hover:bg-line">← Back</Link>
        <Link to={ROUTES.forYou} onClick={() => toast('Taste profile saved')} className="absolute left-[729px] top-[592px] flex h-[48px] w-[240px] items-center justify-center rounded-[24px] bg-accent text-[15px] font-semibold text-white hover:brightness-95">{'Save profile  →'}</Link>
      </Stage>
    </Page>
  )
}

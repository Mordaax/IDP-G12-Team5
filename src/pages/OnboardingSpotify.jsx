// 📸 6 Onboarding (connect spotify) — Figma 1431:2082 — taste profile filled in from Spotify
// (or Apple Music). Everything stays editable; the profile bar updates as you pick.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page, Stage } from '@/components/Layout'
import { GenreCard, OnboardingHeader, SongCard, toggleIn } from '@/components/onboarding/Onboarding'
import { GENRES, ROUTES } from '@/data'

// Share of each main genre in the profile; the numbers from Figma for the starting picks.
const WEIGHTS = { Electronic: 62, 'Pop Music': 25, 'Contemporary Mandopop': 13, 'Indie Rock': 18, 'Hip-Hop': 15, 'Traditional Ethnic Music': 10 }

export default function OnboardingSpotify() {
  const [params] = useSearchParams()
  const service = params.get('from') === 'apple' ? 'Apple Music' : 'Spotify'
  const [genres, setGenres] = useState(['Pop Music', 'Contemporary Mandopop', 'Electronic', 'Synthwave'])
  const [songs, setSongs] = useState(['Tracks of the Woods', 'Slow Burn'])

  const mains = GENRES.map((g) => g.name).filter((n) => genres.includes(n))
  const total = mains.reduce((s, n) => s + WEIGHTS[n], 0)
  const profile = mains
    .map((n) => ({ name: n, pct: Math.round((WEIGHTS[n] / total) * 100), dot: GENRES.find((g) => g.name === n).dot }))
    .sort((a, b) => b.pct - a.pct)

  return (
    <Page active="discover">
      <div className="h-px w-full bg-divider" />
      <Stage height={827}>
        <OnboardingHeader title="Let’s build your taste profile" subtitle={`Connected to ${service}. We picked these from your listening — change anything you like.`} />

        <GenreCard x={185} y={158} title="Pick your genres" chipStyle="dark" selected={genres} onToggle={toggleIn(setGenres)} />
        <SongCard x={730} y={157} title="Pick your songs" added={songs} onToggle={toggleIn(setSongs)} />

        <div className="absolute left-[185px] top-[518px] flex h-[72px] w-[1060px] items-center rounded-card border border-line bg-soft px-[23px]">
          <div className="w-[342px] leading-normal">
            <p className="m-0 text-[10px] font-semibold text-subtle">YOUR TASTE PROFILE</p>
            <p className="m-0 mt-[6px] text-[12px] text-muted">Updates as you pick. You can change it any time.</p>
          </div>
          <div className="flex gap-[10px]">
            {profile.length ? profile.map((p) => (
              <span key={p.name} className="flex h-[30px] items-center gap-[6px] rounded-[15px] border border-line bg-surface px-[11px] text-[12px] text-ink">
                <span className="size-[8px] rounded-full" style={{ background: p.dot }} />{p.pct}% {p.name}
              </span>
            )) : <span className="text-[13px] text-subtle">Pick at least one genre.</span>}
          </div>
        </div>

        <Link to={ROUTES.forYou} aria-disabled={!profile.length}
          className={`absolute left-1/2 top-[633px] flex h-[48px] w-[240px] -translate-x-1/2 items-center justify-center rounded-control text-[15px] font-semibold ${profile.length ? 'text-on-accent bg-accent hover:bg-accent-hover' : 'pointer-events-none bg-line text-subtle'}`}>
          {'Next  →'}
        </Link>
      </Stage>
    </Page>
  )
}

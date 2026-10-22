// 📸 10 Artist page (portfolio) — Figma 1431:1913, 📸 11 Artist page (upcoming events) — Figma 1431:2008.
// "Past Events" is the third tab the frames show.
import { useState } from 'react'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { EVENTS_DB, IMG, ROUTES } from '@/data'
import { useShare, useToast } from '@/lib/toast'
import { useSession, useSessionState } from '@/lib/useSession'

const glass = 'flex h-[48px] items-center justify-center gap-[8px] rounded-control border border-white/45 bg-white/18 px-[24px] text-[14px] font-semibold text-white shadow-pop backdrop-blur-[8px] transition-colors hover:bg-white/30'

const WORKS = [
  { title: 'Tracks of the Woods', by: 'FallingIslands' },
  { title: 'City Busk Nights (Live)', by: 'FallingIslands · Kim Tan' },
  { title: 'Echo Ambient Session #3', by: 'FallingIslands' },
]
const SOCIALS = [
  ['instagram', 'Instagram', 'https://www.instagram.com/explore/search/keyword/?q=fallingislands'],
  ['twitter', 'X (Twitter)', 'https://x.com/search?q=fallingislands'],
  ['spotify', 'Spotify', 'https://open.spotify.com/search/fallingislands'],
  ['youtube', 'YouTube', 'https://www.youtube.com/results?search_query=fallingislands'],
]

// FallingIslands' upcoming gigs from db.json (the Events section shows them in full).
const COVERS = { 'fallingislands-tinbox': IMG.artistUpcoming, 'fallingislands-battlebox': IMG.eventHero }
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function upcomingGigs() {
  const venues = Object.fromEntries(EVENTS_DB.venues.map((v) => [v.id, v]))
  const today = new Date()
  return EVENTS_DB.events
    .filter((e) => (e.headliner === 'fallingislands' || e.supports.includes('fallingislands')) && e.dayOffset >= 0)
    .sort((a, b) => a.dayOffset - b.dayOffset)
    .map((e) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + e.dayOffset)
      const [h, m] = e.time.split(':').map(Number)
      return {
        id: e.id,
        title: e.name || `FallingIslands at ${venues[e.venueId].listName}`,
        when: `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`,
        cover: COVERS[e.id] || IMG.fallingArt,
      }
    })
}

// Gigs FallingIslands has already played: [venue id, days ago, how many went].
const PAST = [['projector', 12, 96], ['haji-lane', 26, 64], ['esplanade-annexe', 41, 188], ['clarke-quay', 58, 142], ['tekka', 77, 71], ['kilo', 95, 53]]
function pastGigs() {
  const venues = Object.fromEntries(EVENTS_DB.venues.map((v) => [v.id, v]))
  const today = new Date()
  return PAST.map(([venueId, daysAgo, went], i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo)
    return {
      id: `${venueId}-${daysAgo}`,
      title: `FallingIslands at ${venues[venueId].listName}`,
      when: `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      went,
      cover: i % 2 ? IMG.fallingArt : IMG.artistUpcoming,
    }
  })
}

export default function ArtistPage({ tab }) {
  const toast = useToast()
  const share = useShare()
  const { signedIn, requireLogin } = useSession()
  const [saved, setSaved] = useSessionState('artist.fallingislands.saved', false)
  const [playing, setPlaying] = useState(null)
  const upcoming = upcomingGigs()
  const past = pastGigs()

  const TABS = [
    ['portfolio', 'Portfolio', ROUTES.artist],
    ['events', 'Upcoming Event', ROUTES.artistEvents],
    ['past', 'Past Events', ROUTES.artistPast],
  ]

  return (
    <Page active="artists">
      {/* hero */}
      <div className="relative h-[240px] w-full shrink-0 overflow-hidden bg-black">
        <img src={IMG.artistHero} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="relative flex h-full flex-col justify-between px-[clamp(20px,3.5vw,48px)] pb-[48px] pt-[24px]">
          <Link to={signedIn ? ROUTES.artistWidget : ROUTES.discover} className="flex items-center gap-[8px] self-start text-[14px] font-semibold text-white hover:underline">
            <img src="/assets/icons/arrow-left-white.svg" alt="" width="16" height="16" /> Back to Artists
          </Link>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-[16px]">
              <div className="flex gap-[8px]">
                <span className="rounded-[6px] bg-[rgba(var(--lrm-raw-rgb-747480),0.08)] px-[12px] py-[6px] text-[12px] font-bold text-white">LIVE SYNTH SETS</span>
                <span className="rounded-[6px] bg-black px-[12px] py-[6px] text-[12px] font-bold text-white">SYNTHWAVE / EDM</span>
              </div>
              <h1 className="font-display m-0 text-[48px] leading-normal font-extrabold text-white">FallingIslands</h1>
            </div>
            <div className="flex gap-[12px]">
              <button type="button" aria-pressed={saved} onClick={() => requireLogin(() => { setSaved(!saved); toast(saved ? 'Removed from saved artists' : 'Saved FallingIslands') })} className={`${glass} w-[161px]`}>
                {saved ? <span className="text-[16px] leading-none">♥</span> : <img src="/assets/icons/heart-white.svg" alt="" width="16" height="16" />}
                {saved ? 'Saved' : 'Save Artist'}
              </button>
              <button type="button" onClick={() => share('FallingIslands')} className={glass}>
                <img src="/assets/icons/share-white.svg" alt="" width="16" height="16" /> Share
              </button>
              <Link to={ROUTES.thread} className={glass}>Forum threads</Link>
            </div>
          </div>
        </div>
      </div>

      {/* profile body */}
      <main className="flex w-full flex-col gap-[32px] px-[clamp(20px,5.5vw,80px)] pb-[60px] pt-[40px]">
        <section className="flex flex-col gap-[12px]">
          <h2 className="font-display m-0 text-[16px] font-bold text-ink">About Artist</h2>
          <p className="m-0 text-[14px] leading-[1.5] text-muted">FallingIslands builds neon synthwave out of analogue arpeggios and late-night field recordings. A regular on Singapore’s underground electronic circuit, they play warehouse rooms, listening bars and the occasional bunker.</p>
          <h2 className="font-display m-0 mt-[4px] text-[16px] font-bold text-ink">Social Media</h2>
          <div className="flex gap-[12px]">
            {SOCIALS.map(([key, name, url]) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={`FallingIslands on ${name}`} className="block size-[44px] rounded-full transition-transform hover:scale-110">
                <img src={`/assets/icons/social-${key}.svg`} alt="" width="44" height="44" />
              </a>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-[12px]">
          <nav className="flex gap-[24px]" aria-label="Artist sections">
            {TABS.map(([key, label, to]) => (
              <Link key={key} to={to} replace aria-current={tab === key ? 'page' : undefined}
                className={`py-[10px] text-[16px] ${tab === key ? 'border-b-2 border-ink font-bold text-ink' : 'font-medium text-muted hover:text-ink'}`}>
                {label}
              </Link>
            ))}
          </nav>
          {tab !== 'portfolio' && <div className="-mt-[12px] h-px bg-divider" />}

          {tab === 'portfolio' && (
            <div className="mt-[20px] grid grid-cols-3 gap-[20px]">
              {WORKS.map((w) => (
                <article key={w.title} className="overflow-hidden rounded-card border border-divider bg-surface">
                  <button type="button" onClick={() => setPlaying(playing === w.title ? null : w.title)} aria-label={playing === w.title ? `Pause ${w.title}` : `Play ${w.title}`}
                    className="group relative flex h-[120px] w-full flex-col items-center justify-center gap-[8px] border-b border-divider">
                    <img src={IMG.fallingArt} alt="" className="absolute inset-0 size-full object-cover" />
                    <span className={`relative flex size-[44px] items-center justify-center rounded-full bg-white/90 text-[14px] text-ink shadow transition-opacity ${playing === w.title ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {playing === w.title ? '❚❚' : '▶'}
                    </span>
                  </button>
                  <div className="flex flex-col gap-[8px] p-[16px]">
                    <p className="m-0 text-[15px] font-semibold text-ink">{w.title}</p>
                    <p className="m-0 text-[13px] text-muted">{playing === w.title ? '▶ Now playing' : w.by}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === 'events' && (
            <>
              <Link to={`${ROUTES.eventsList}?artist=fallingislands`} className="self-start text-[16px] leading-[1.4] text-ink underline hover:text-accent">See all upcoming events</Link>
              <div className="mt-[20px] grid grid-cols-3 gap-[20px]">
                {upcoming.map((e) => (
                  <Link key={e.id} to={`/events/${e.id}`} className="group overflow-hidden rounded-card border border-divider bg-surface transition-shadow hover:shadow-pop">
                    <img src={e.cover} alt="" className="h-[120px] w-full border-b border-divider object-cover" />
                    <div className="flex flex-col gap-[8px] p-[16px]">
                      <p className="m-0 text-[15px] font-semibold text-ink group-hover:underline">{e.title}</p>
                      <p className="m-0 text-[13px] text-muted">{e.when}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {tab === 'past' && (
            <div className="mt-[20px] grid grid-cols-3 gap-[20px]">
              {past.map((e) => (
                <article key={e.id} className="overflow-hidden rounded-card border border-divider bg-surface">
                  <img src={e.cover} alt="" className="h-[120px] w-full border-b border-divider object-cover" />
                  <div className="flex flex-col gap-[8px] p-[16px]">
                    <p className="m-0 text-[15px] font-semibold text-ink">{e.title}</p>
                    <p className="m-0 text-[13px] text-muted">{e.when} · {e.went} went</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </Page>
  )
}

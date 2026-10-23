// Artist overview: profile on the left, releases and events together on the right.
import { useEffect, useState } from 'react'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { EVENTS_DB, GENRE_BY_KEY, IMG, ROUTES } from '@/data'
import { useShare, useToast } from '@/lib/toast'
import { useSession, useSessionState } from '@/lib/useSession'

const secondaryAction = 'flex min-h-[44px] items-center justify-center gap-[8px] rounded-control border border-line bg-surface px-[16px] text-[13px] font-semibold text-ink transition-colors hover:bg-soft'

const WORKS = [
  { title: 'Tracks of the Woods', by: 'DJ Beatroot' },
  { title: 'City Busk Nights (Live)', by: 'DJ Beatroot · Kim Tan' },
  { title: 'Echo Ambient Session #3', by: 'DJ Beatroot' },
]
const SOCIALS = [
  ['instagram', 'Instagram', 'https://www.instagram.com/explore/search/keyword/?q=DJ%20Beatroot'],
  ['twitter', 'X (Twitter)', 'https://x.com/search?q=DJ%20Beatroot'],
  ['spotify', 'Spotify', 'https://open.spotify.com/search/DJ%20Beatroot'],
  ['youtube', 'YouTube', 'https://www.youtube.com/results?search_query=DJ%20Beatroot'],
]

// DJ Beatroot's upcoming gigs from db.json (the Events section shows them in full).
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
        title: e.name || `DJ Beatroot at ${venues[e.venueId].listName}`,
        when: `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`,
        cover: COVERS[e.id] || IMG.fallingArt,
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
  const artist = EVENTS_DB.artists.find((item) => item.id === 'fallingislands')
  const genre = GENRE_BY_KEY[artist.genreId]
  const genreNames = [genre.name, ...artist.tags.map((tag) => tag === 'synthwave' ? 'Synthwave' : tag)]

  // Preserve existing links to the former event tabs as section entry points.
  useEffect(() => {
    const section = { events: 'upcoming-events', past: 'past-events' }[tab]
    if (section) document.getElementById(section)?.scrollIntoView({ block: 'start' })
  }, [tab])

  return (
    <Page active="artists">
      <main className="mx-auto w-full max-w-[1440px] px-[clamp(20px,5.5vw,80px)] pb-[60px] pt-[24px]">
        <div className="mb-[24px] flex flex-wrap items-center justify-between gap-[16px]">
          <Link to={signedIn ? ROUTES.artistWidget : ROUTES.discover} className="flex min-h-[44px] items-center gap-[8px] text-[14px] font-semibold text-muted hover:text-ink hover:underline">
            <span aria-hidden="true">←</span> Back to Artists
          </Link>
          <div className="flex flex-wrap gap-[8px]">
            <button type="button" aria-pressed={saved} onClick={() => requireLogin(() => { setSaved(!saved); toast(saved ? 'Removed from saved artists' : 'Saved DJ Beatroot') })}
              className="flex min-h-[44px] items-center justify-center gap-[8px] rounded-control bg-accent px-[20px] text-[13px] font-semibold text-on-accent transition-colors hover:bg-accent-hover">
              <span aria-hidden="true">{saved ? '♥' : '♡'}</span>{saved ? 'Saved' : 'Save Artist'}
            </button>
            <button type="button" onClick={() => share('DJ Beatroot')} className={secondaryAction}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                <path d="M12 3v12m-4-8 4-4 4 4M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
              </svg>
              Share
            </button>
            <Link to={ROUTES.thread} className={secondaryAction}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                <path d="M8 10h8M8 14h5" />
              </svg>
              Forum threads
            </Link>
          </div>
        </div>

        <div className="grid items-start gap-[48px] grid-cols-[320px_minmax(0,1fr)]">
          <section aria-labelledby="artist-name" className="flex min-w-0 flex-col gap-[24px]">
            <img src={IMG.fallingAvatar} alt="DJ Beatroot" className="aspect-square w-full max-w-[400px] rounded-card object-cover" />
            <div>
              <p className="m-0 mb-[8px] text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">Fictional artist · Singapore</p>
              <h1 id="artist-name" className="font-display m-0 text-[32px] leading-[1.2] font-semibold text-ink">DJ Beatroot</h1>
              <p className="m-0 mt-[12px] text-[14px] leading-[1.65] text-muted">DJ Beatroot builds neon synthwave out of analogue arpeggios and late-night field recordings. A regular on Singapore’s underground electronic circuit, they play warehouse rooms, listening bars and the occasional bunker.</p>
            </div>

            <nav aria-label="Artist social media" className="flex flex-wrap gap-[12px]">
              {SOCIALS.map(([key, name, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={`DJ Beatroot on ${name}`} title={name} className="block size-[44px] rounded-full transition-transform hover:scale-110">
                  <img src={`/assets/icons/social-${key}.svg`} alt="" width="44" height="44" />
                </a>
              ))}
            </nav>

            <div>
              <h2 className="font-display m-0 mb-[12px] text-[18px] font-semibold text-ink">Genres &amp; Subgenres</h2>
              <div className="flex flex-wrap gap-[8px]">
                {genreNames.map((name) => (
                  <span key={name} className="inline-flex min-h-[30px] items-center gap-[8px] rounded-full border border-line bg-surface px-[12px] text-[12px] text-ink">
                    <span aria-hidden="true" className="size-[8px] rounded-full" style={{ background: genre.dot }} />{name}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-line pt-[20px]">
              <p className="m-0 text-[14px] text-muted"><strong className="text-[24px] font-semibold text-ink">2,946</strong><br />listeners on LittleRedMusic</p>
              <p className="m-0 mt-[6px] text-[11px] text-subtle">Prototype count · not live analytics</p>
            </div>
          </section>

          <div className="flex min-w-0 flex-col gap-[40px]">
            <section aria-labelledby="releases-heading">
              <h2 id="releases-heading" className="font-display m-0 mb-[16px] text-[24px] leading-[1.3] font-semibold text-ink">Albums &amp; Singles</h2>
              <div className="grid grid-cols-3 gap-[16px]">
                {WORKS.map((work) => (
                  <article key={work.title} className="min-w-0 overflow-hidden rounded-card border border-line bg-surface">
                    <button type="button" onClick={() => setPlaying(playing === work.title ? null : work.title)} aria-pressed={playing === work.title} aria-label={playing === work.title ? `Pause ${work.title}` : `Play ${work.title}`}
                      className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-line">
                      <img src={IMG.fallingArt} alt="" className="absolute inset-0 size-full object-cover transition-transform group-hover:scale-105" />
                      <span className={`relative flex size-[44px] items-center justify-center rounded-full bg-surface text-[14px] text-ink shadow-pop transition-opacity ${playing === work.title ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
                        {playing === work.title ? '❚❚' : '▶'}
                      </span>
                    </button>
                    <div className="p-[16px]">
                      <h3 className="font-display m-0 text-[14px] leading-[1.4] font-semibold text-ink">{work.title}</h3>
                      <p aria-live="polite" className="m-0 mt-[6px] text-[12px] leading-[1.5] text-muted">{playing === work.title ? '▶ Preview selected' : work.by}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="upcoming-events" aria-labelledby="upcoming-heading" className="scroll-mt-[24px]">
              <div className="mb-[16px] flex flex-wrap items-center justify-between gap-[12px]">
                <h2 id="upcoming-heading" className="font-display m-0 text-[24px] leading-[1.3] font-semibold text-ink">Upcoming Events</h2>
                <Link to={`${ROUTES.eventsList}?artist=fallingislands`} className="text-[13px] font-semibold text-accent hover:underline">See all upcoming events →</Link>
              </div>
              <div className="grid grid-cols-3 gap-[16px]">
                {upcoming.map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="group min-w-0 overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-pop">
                    <img src={event.cover} alt="" className="aspect-[4/3] w-full border-b border-line object-cover" />
                    <div className="p-[16px]">
                      <h3 className="font-display m-0 text-[14px] leading-[1.4] font-semibold text-ink group-hover:underline">{event.title}</h3>
                      <p className="m-0 mt-[6px] text-[12px] leading-[1.5] text-muted">{event.when}</p>
                    </div>
                  </Link>
                ))}
              </div>
              {!upcoming.length && <p className="m-0 rounded-card border border-dashed border-line p-[24px] text-[14px] text-muted">No upcoming events announced yet.</p>}
            </section>

            <section id="past-events" aria-labelledby="past-heading" className="scroll-mt-[24px]">
              <h2 id="past-heading" className="font-display m-0 mb-[16px] text-[24px] leading-[1.3] font-semibold text-ink">Past Events</h2>
              <div className="rounded-card border border-dashed border-line bg-soft px-[24px] py-[32px]">
                <p className="m-0 text-[14px] font-semibold text-ink">No past events yet</p>
                <p className="m-0 mt-[6px] text-[13px] leading-[1.5] text-muted">Shows DJ Beatroot has played on LittleRedMusic will appear here.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </Page>
  )
}

import { useState } from 'react'
import Link from '@/components/AppLink'
import { GENRES, IMG, ROUTES } from '@/data'
import { useToast } from '@/lib/toast'
import ArtistSearch from './ArtistSearch'

const shadow = 'shadow-[0px_2px_12px_0px_rgba(0,0,0,0.3)]'

/**
 * The Discover left menu, on every Discover page (signed in or out): artist search,
 * Genres & Moods filter card, stats pill and the Legend.
 */
export function DiscoverMenu({ hidden, onToggleGenre, signedIn = false }) {
  return (
    <div className="absolute bottom-[24px] left-[36px] top-[24px] z-10 flex flex-col gap-[22px] overflow-y-auto overflow-x-visible pb-[4px] [scrollbar-width:none]">
      <GraphControls hidden={hidden} onToggleGenre={onToggleGenre} signedIn={signedIn} />
      <Legend />
    </div>
  )
}

/** Toggle a genre key in a Set held in state. */
export const toggleGenreIn = (setHidden) => (key) =>
  setHidden((h) => {
    const next = new Set(h)
    if (!next.delete(key)) next.add(key)
    return next
  })

/** Figma "Graph controls": artist search, Genres & Moods filter card, stats pill. */
export function GraphControls({ hidden, onToggleGenre, signedIn = false }) {
  const [open, setOpen] = useState(true)
  const [moods, setMoods] = useState({ Chill: true, Upbeat: false, 'Late night': true, Euphoric: false, Melancholy: false, Raw: false })
  const shown = GENRES.length - hidden.size

  return (
    <div className="flex w-[300px] flex-col items-start gap-[12px]">
      <ArtistSearch
        signedIn={signedIn}
        placeholder="Search artists…"
        className={`h-[44px] w-[300px] rounded-[999px] bg-white py-[12px] pl-[16px] pr-[18px] ring-1 ring-inset ring-line shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)]`}
        inputClass="placeholder:text-muted"
        icon={<img src="/assets/icons/search-15.svg" alt="" width="15" height="15" className="size-[15px] shrink-0" />}
      />

      {open ? (
        <div className={`flex w-[300px] flex-col items-start gap-[8px] rounded-[16px] bg-white p-[16px] ring-1 ring-inset ring-line ${shadow}`}>
          <div className="flex h-[38px] w-[268px] items-center gap-[9px] rounded-[10px] bg-soft px-[12px] ring-1 ring-inset ring-line">
            <img src="/assets/icons/search-13.svg" alt="" width="13" height="13" className="size-[13px] shrink-0" />
            <p className="m-0 flex-1 text-[13px] leading-[1.4] text-ink">Genres <span className="text-muted">· {shown} of {GENRES.length}</span></p>
            <span className="relative size-[14px] shrink-0" aria-hidden="true">
              <span className="absolute left-0 top-[3px] h-[1.5px] w-[14px] rounded-[1px] bg-muted" />
              <span className="absolute left-[2px] top-[7px] h-[1.5px] w-[10px] rounded-[1px] bg-muted" />
              <span className="absolute left-[4px] top-[11px] h-[1.5px] w-[6px] rounded-[1px] bg-muted" />
            </span>
          </div>

          <ul className="m-0 flex w-[268px] list-none flex-col p-0">
            {GENRES.map((g) => {
              const on = !hidden.has(g.key)
              return (
                <li key={g.key} className="h-[32px] w-[258px]">
                  <label className="flex size-full cursor-pointer items-center gap-[9px]">
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => onToggleGenre(g.key)} />
                    {on
                      ? <img src="/assets/icons/checkbox-checked.svg" alt="" width="16" height="16" className="size-[16px] shrink-0" />
                      : <span className="size-[16px] shrink-0 rounded-[3px] border-[1.5px] border-subtle bg-white" />}
                    <span className="size-[9px] shrink-0 rounded-full" style={{ background: g.dot }} />
                    <span className={`flex-1 text-[13px] leading-[1.4] font-medium ${on ? 'text-ink' : 'text-subtle'}`}>{g.name}</span>
                  </label>
                </li>
              )
            })}
          </ul>

          <div className="h-px w-[268px] bg-divider" />
          <p className="m-0 whitespace-nowrap text-[11px] leading-[1.4] font-bold tracking-[0.66px] text-muted">MOODS</p>
          <div className="flex w-[268px] flex-wrap gap-x-[11px] gap-y-[12px]">
            {Object.entries(moods).map(([name, on]) => (
              <button key={name} type="button" role="switch" aria-checked={on} onClick={() => setMoods((m) => ({ ...m, [name]: !on }))} className="flex w-[82px] flex-col items-start gap-[5px] text-left">
                <img src={on ? '/assets/icons/switch-on.svg' : '/assets/icons/switch-off.svg'} alt="" width="34" height="18" className="h-[18px] w-[34px]" />
                <span className={`w-full text-[11px] leading-[1.4] ${on ? 'font-medium text-ink-2' : 'text-ink-soft'}`}>{name}</span>
              </button>
            ))}
          </div>

          <div className="flex h-[32px] w-full items-center justify-end">
            <button type="button" onClick={() => setOpen(false)} className="rounded-[999px] bg-ink px-[14px] py-[8px] text-[12px] leading-normal text-white hover:bg-black">Hide</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`flex items-center gap-[8px] rounded-[999px] bg-white px-[16px] py-[10px] text-[13px] font-semibold text-ink ring-1 ring-inset ring-line ${shadow}`}>
          <img src="/assets/icons/search-13.svg" alt="" width="13" height="13" /> Genres &amp; moods
        </button>
      )}

      <div className="flex items-center gap-[8px] rounded-[12px] bg-white px-[14px] py-[9px] ring-1 ring-inset ring-line">
        <span className="size-[9px] rounded-full bg-[#a98be0]" />
        <p className="m-0 whitespace-nowrap text-[12px] leading-[1.4] text-muted">178 artists · 412 shared-audience links</p>
      </div>
    </div>
  )
}

/** Figma "Legend" card (bottom-left of the map). The chevron folds it away. */
export function Legend() {
  const [open, setOpen] = useState(true)
  return (
    <section className={`flex w-[300px] flex-col items-start gap-[8px] rounded-[16px] bg-white p-[16px] ring-1 ring-inset ring-line ${shadow}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-[8px] text-left">
        <img src="/assets/icons/legend.svg" alt="" width="18" height="18" className="size-[18px] shrink-0" />
        <h2 className="m-0 flex-1 text-[13px] leading-[1.4] font-semibold text-ink">Legend</h2>
        <img src="/assets/icons/chevron-up.svg" alt="" width="11" height="6" className={`transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
      {open && (
        <>
          <div className="h-px w-[268px] bg-divider" />
          <p className="m-0 whitespace-nowrap text-[11px] leading-[1.4] font-bold tracking-[0.66px] text-muted">DOT COLOUR = GENRE</p>
          <div className="flex w-full flex-wrap gap-x-[8px] gap-y-[7px]">
            {GENRES.map((g) => (
              <div key={g.key} className="flex w-[130px] items-center gap-[7px]">
                <span className="size-[9px] shrink-0 rounded-full" style={{ background: g.dot }} />
                <p className="m-0 flex-1 text-[10px] leading-[1.4] text-ink-2">{g.name}</p>
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-divider" />
          <div className="flex w-full items-center gap-[9px]">
            <span className="size-[10px] shrink-0 rounded-full bg-[#9c9a98]" />
            <p className="m-0 whitespace-nowrap text-[12px] leading-[1.4] text-ink-2">Bigger dot = more fans</p>
          </div>
          <div className="flex w-full items-center gap-[9px]">
            <span className="h-[2px] w-[18px] shrink-0 rounded-[99px] bg-[#4e4a57]" />
            <p className="m-0 whitespace-nowrap text-[12px] leading-[1.4] text-ink-2">Line = shared audience</p>
          </div>
        </>
      )}
    </section>
  )
}

/** Figma "panel / Welcome (walkthrough guide)" — signed out only. */
export function WelcomeGuide({ onClose }) {
  const STEPS = [
    { title: 'Click on the dots', body: 'One dot, one artist. Find new artists' },
    { title: 'Follow the lines', body: 'A line means two artists share an audience — so one band you love leads you to the next.' },
    { title: 'Narrow the search', body: 'Search finds artists only. Use the genre filter to light up one scene at a time.' },
    { title: 'Open anything', body: 'Click a dot for that artist’s page, gigs and threads. Recentre resets the whole view.' },
  ]
  return (
    <aside aria-label="How to read this map" className="relative w-[400px] animate-pop rounded-[16px] border border-line bg-white px-[23px] pb-[24px] pt-[23px] shadow-[0px_10px_12px_0px_rgba(0,0,0,0.35)]">
      <button type="button" onClick={onClose} aria-label="Close the guide" className="absolute right-[14px] top-[12px] flex size-[28px] items-center justify-center rounded-full text-[20px] leading-none text-muted hover:bg-soft">×</button>
      <p className="m-0 text-[11px] leading-[15px] font-bold text-muted">HOW TO READ THIS MAP</p>
      <h1 className="m-0 mt-[10px] text-[24px] leading-[32px] font-semibold text-ink-2">Your 4-step guide to the web of dots.</h1>
      <p className="m-0 mt-[12px] text-[14px] leading-[22px] text-muted">Every dot is an artist playing in Singapore; the lines are the audiences they share.</p>
      <ol className="m-0 mt-[20px] flex list-none flex-col gap-[25px] p-0">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-[12px]">
            <span className="relative flex size-[24px] shrink-0 items-center justify-center text-[12px] leading-[24px] font-bold text-ink-2">
              <img src="/assets/icons/step-badge.svg" alt="" width="24" height="24" className="absolute inset-0" />
              <span className="relative">{i + 1}</span>
            </span>
            <span className="pt-[3px]">
              <span className="block text-[14px] leading-[18px] font-semibold text-ink-2">{s.title}</span>
              <span className="mt-[4px] block text-[13px] leading-[17px] text-muted">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-[24px] h-px bg-divider" />
      <Link to={ROUTES.signup} className="mt-[21px] flex h-[48px] items-center justify-center rounded-[24px] bg-brand text-[15px] font-semibold text-white hover:brightness-95">Create an account</Link>
      <Link to={ROUTES.login} className="mt-[12px] flex h-[48px] items-center justify-center rounded-[24px] border border-line text-[15px] font-semibold text-ink-2 hover:bg-wash">Log in</Link>
      <p className="m-0 mt-[16px] text-[12px] leading-[17px] text-muted">Keep browsing as a guest — this guide stays available from the ? Help icon on the map.</p>
    </aside>
  )
}

/** Figma "panel / Recommended for you" (288 × 560). The play button previews a track. */
export function RecommendedPanel({ onClose, closeTo, metalDot = '#64748b', seeAllTo }) {
  const [playing, setPlaying] = useState(0)
  const ROWS = [
    { title: 'Low Tide', sub: 'FallingIslands · synthwave', dot: '#0fb3a1', to: ROUTES.artistWidget },
    { title: 'Midnight Transit', sub: 'Evanturetime · EDM', dot: '#0fb3a1', to: `${ROUTES.eventsList}?artist=evanturetime` },
    { title: 'Slow Burn', sub: 'Lullaboy · alt-pop', dot: '#f5a524', to: `${ROUTES.eventsList}?artist=lullaboy` },
    { title: 'Kampong Bass', sub: 'Fauxe · EDM', dot: '#0fb3a1' },
    { title: 'Coastline', sub: 'Marian Carmel · alt-pop', dot: '#f5a524' },
    { title: 'Hollow Bark', sub: 'Wormrot · metal', dot: metalDot },
  ]
  const CloseTag = closeTo ? Link : 'button'
  return (
    <aside className="relative h-[560px] w-[288px] animate-pop rounded-[12px] bg-white shadow-[0px_6px_20px_0px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-line">
      <h2 className="absolute left-[20px] top-[20px] m-0 whitespace-nowrap text-[16px] leading-normal font-semibold text-ink">Recommended for you</h2>
      <p className="absolute left-[20px] top-[44px] m-0 whitespace-nowrap text-[11px] leading-normal text-subtle">From your taste profile · 78% EDM</p>
      <CloseTag to={closeTo} type={closeTo ? undefined : 'button'} onClick={onClose} aria-label="Close recommendations" className="absolute left-[246px] top-[18px] block size-[24px] rounded-[12px] ring-1 ring-inset ring-line hover:bg-soft">
        <span className="absolute left-[7px] top-[2px] text-[14px] leading-normal text-muted">×</span>
      </CloseTag>
      {ROWS.map((r, i) => {
        const t = 76 + i * 68
        const isPlaying = playing === i
        const Title = r.to ? Link : 'span'
        return (
          <div key={r.title}>
            <div className="absolute left-[20px] h-[44px] w-[248px]" style={{ top: t }}>
              <button type="button" onClick={() => setPlaying(isPlaying ? null : i)} aria-label={isPlaying ? `Pause ${r.title}` : `Play ${r.title}`}
                className="absolute left-0 top-0 flex size-[44px] items-center justify-center rounded-[8px] bg-line hover:bg-line">
                {isPlaying
                  ? <span className="flex h-[22px] items-end gap-[3px]">{[0, 1, 2].map((b) => <i key={b} className="block h-full w-[4px] origin-bottom animate-eq bg-black" style={{ animationDelay: `${-b * 0.3}s` }} />)}</span>
                  : <svg width="18" height="20" viewBox="0 0 24 28" aria-hidden="true"><path d="M0 0L24 14L0 28Z" fill="#000" /></svg>}
              </button>
              <Title to={r.to} className={`absolute left-[56px] top-[4px] whitespace-nowrap text-[13px] leading-normal font-semibold text-ink ${r.to ? 'hover:underline' : ''}`}>
                {r.title}{isPlaying ? ' (Now playing)' : ''}
              </Title>
              <span className="absolute left-[56px] top-[22px] whitespace-nowrap text-[11px] leading-normal text-subtle">{r.sub}</span>
              <span className="absolute left-[234px] top-[18px] size-[8px] rounded-full" style={{ background: r.dot }} />
            </div>
            <div className="absolute left-[20px] h-px w-[248px] bg-divider" style={{ top: t + 56 }} />
          </div>
        )
      })}
      <Link to={seeAllTo} className="absolute left-[20px] top-[508px] whitespace-pre text-[12px] leading-normal font-semibold text-ink hover:underline">{'See all 128 recommendations  →'}</Link>
    </aside>
  )
}

/** Figma "Artist drawer" (📸 9) — FallingIslands summary card. */
export function ArtistDrawer({ onDismiss }) {
  const toast = useToast()
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(false)
  const STATS = [['3k', 'fans'], ['2', 'threads'], ['4', 'collabs']]
  const LINKS = [
    ['Spotify', 'https://open.spotify.com/search/fallingislands'],
    ['Bandcamp', 'https://bandcamp.com/search?q=fallingislands'],
    ['Instagram', 'https://www.instagram.com/explore/search/keyword/?q=fallingislands'],
    ['YouTube', 'https://www.youtube.com/results?search_query=fallingislands'],
  ]
  return (
    <aside aria-label="FallingIslands" className="w-[362px] animate-pop rounded-[20px] bg-white p-[20px] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.4)]">
      <div className="flex items-start gap-[13px]">
        <img src={IMG.fallingAvatar} alt="" width="58" height="58" className="size-[58px] rounded-full object-cover" />
        <div className="flex-1 pt-[2px]">
          <h2 className="m-0 text-[23px] leading-[1.4] font-bold text-ink">FallingIslands</h2>
          <p className="m-0 text-[13px] leading-[1.4] text-muted">Synthwave / EDM · Singapore</p>
        </div>
        <button type="button" aria-pressed={saved} aria-label={saved ? 'Unsave artist' : 'Save artist'}
          onClick={() => { setSaved(!saved); toast(saved ? 'Removed from saved artists' : 'Saved FallingIslands') }}
          className={`mt-[10px] text-[22px] leading-none ${saved ? 'text-brand' : 'text-subtle hover:text-brand'}`}>{saved ? '♥' : '♡'}</button>
      </div>
      <div className="mt-[15px] flex gap-[8px]">
        {STATS.map(([v, l]) => (
          <div key={l} className="h-[60px] w-[102px] rounded-[12px] bg-soft px-[15px] pt-[10px]">
            <p className="m-0 text-[17px] leading-[1.4] font-bold text-ink">{v}</p>
            <p className="m-0 text-[11px] leading-[1.4] text-muted">{l}</p>
          </div>
        ))}
      </div>
      <p className="m-0 mt-[15px] text-[13px] leading-[1.4] text-ink">I make bleeps, bloops, and sometimes even music.</p>
      <p className="m-0 mt-[8px] text-[12px] leading-[1.5] text-muted">Logic Pro + Ableton Live Instructor @ POP Studio Academy<br />Resident DJ @ Blacklight Tribe<br />Assistant Tutor @ NUS Electronic Music Lab</p>
      <div className="mt-[14px] flex flex-wrap gap-[8px]">
        {LINKS.map(([t, url]) => (
          <a key={t} href={url} target="_blank" rel="noopener noreferrer" className="rounded-[999px] border border-line bg-soft px-[14px] py-[7px] text-[12px] leading-[1.4] font-medium text-ink hover:bg-soft">{t}</a>
        ))}
      </div>
      <div className="mt-[16px] h-px bg-line" />
      <div className="mt-[16px] flex gap-[9px]">
        <Link to={ROUTES.artist} className="flex h-[46px] w-[179px] items-center justify-center rounded-[999px] bg-ink text-[14px] font-semibold text-white hover:bg-black">Open artist page</Link>
        <button type="button" onClick={onDismiss} className="h-[46px] w-[134px] rounded-[999px] border-[1.5px] border-ink bg-white text-[14px] font-semibold text-ink hover:bg-wash">Not Interested</button>
      </div>
      <button type="button" onClick={() => { setFollowing(!following); toast(following ? 'Unfollowed FallingIslands' : 'Following FallingIslands') }}
        className={`mt-[15px] h-[46px] w-full rounded-[999px] text-[14px] font-semibold ${following ? 'border-[1.5px] border-ink bg-white text-ink' : 'bg-ink text-white hover:bg-black'}`}>
        {following ? 'Following ✓' : 'Follow'}
      </button>
    </aside>
  )
}

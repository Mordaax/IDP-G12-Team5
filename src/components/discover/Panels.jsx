import { useEffect, useState } from 'react'
import Link from '@/components/AppLink'
import { ARTISTS, GENRES, GENRE_BY_KEY, SHARED_AUDIENCES, SUBGENRES, SUBGENRE_BY_ID, ROUTES } from '@/data'
import { useToast } from '@/lib/toast'
import ArtistSearch from './ArtistSearch'
import { recommendedSongsFor } from './recommendations'

const shadow = 'shadow-panel'

/** Discover search, camera shortcuts, stats and colour key. */
export function DiscoverMenu({ focusedGenre, onNavigateGenre, signedIn = false, tourOpen = false }) {
  return (
    <div className="absolute bottom-[24px] left-[36px] top-[24px] z-10 flex flex-col gap-[22px] overflow-y-auto overflow-x-visible pb-[4px] [scrollbar-width:none]">
      <GraphControls focusedGenre={focusedGenre} onNavigateGenre={onNavigateGenre} signedIn={signedIn} tourOpen={tourOpen} />
      <Legend focusedGenre={focusedGenre} />
    </div>
  )
}

export function GraphControls({ focusedGenre, onNavigateGenre, signedIn = false, tourOpen = false }) {
  const [open, setOpen] = useState(true)
  useEffect(() => { if (tourOpen) setOpen(true) }, [tourOpen])
  return (
    <div className="flex w-[300px] flex-col items-start gap-[12px]">
      <ArtistSearch signedIn={signedIn} placeholder="Search artists…"
        className="h-[44px] w-[300px] rounded-control bg-surface py-[12px] pl-[16px] pr-[18px] ring-1 ring-inset ring-line"
        inputClass="placeholder:text-muted"
        icon={<img src="/assets/icons/search-15.svg" alt="" width="15" height="15" className="size-[15px] shrink-0" />} />
      {open ? (
        <div className="flex w-[300px] flex-col items-start gap-[8px] rounded-panel bg-surface p-[16px] ring-1 ring-inset ring-line">
          <div className="flex h-[38px] w-full items-center rounded-control bg-soft px-[12px] ring-1 ring-inset ring-line">
            <h2 className="font-display m-0 flex-1 text-[13px] font-semibold text-ink">Genres</h2>
            <span className="text-[11px] text-muted">Jump to a scene</span>
          </div>
          <ul className="m-0 flex w-full list-none flex-col gap-[2px] p-0" aria-label="Genre shortcuts">
            {GENRES.map(g => (
              <li key={g.key}>
                <button type="button" data-tour={g.key === 'electronic' ? 'genre-choice' : undefined} aria-pressed={focusedGenre === g.key} onClick={() => onNavigateGenre(g.key)}
                  className={`flex h-[34px] w-full items-center gap-[9px] rounded-control px-[10px] text-left text-[13px] font-medium transition-colors hover:bg-soft focus-visible:outline-2 focus-visible:outline-accent ${focusedGenre === g.key ? 'bg-soft text-ink' : 'text-ink-2'}`}>
                  <span className="size-[9px] shrink-0 rounded-full" style={{ background: g.dot }} />
                  <span className="flex-1">{g.name}</span><span aria-hidden="true" className="text-muted">→</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex h-[32px] w-full items-center justify-end">
            <button type="button" onClick={() => setOpen(false)} className="rounded-control bg-soft px-[14px] py-[8px] text-[12px] leading-normal text-ink hover:bg-wash">Hide</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-[8px] rounded-control bg-surface px-[16px] py-[10px] text-[13px] font-semibold text-ink ring-1 ring-inset ring-line">Genres</button>
      )}
      <div className="flex items-center gap-[8px] rounded-card bg-surface px-[14px] py-[9px] ring-1 ring-inset ring-line">
        <span className="size-[9px] rounded-full bg-[var(--lrm-raw-a98be0)]" />
        <p className="m-0 whitespace-nowrap text-[12px] leading-[1.4] text-muted">{ARTISTS.length} artists · {SHARED_AUDIENCES.length} shared-audience links</p>
      </div>
    </div>
  )
}

/** Figma "Legend" card (bottom-left of the map). The chevron folds it away. */
export function Legend({ focusedGenre }) {
  const [open, setOpen] = useState(true)
  const entries = focusedGenre
    ? SUBGENRES.filter(s => s.familyId === focusedGenre).map(s => ({ key: s.id, name: s.label, dot: s.colour.css }))
    : GENRES
  return (
    <section className={`flex w-[300px] flex-col items-start gap-[8px] rounded-panel bg-surface p-[16px] ring-1 ring-inset ring-line ${shadow}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-[8px] text-left">
        <img src="/assets/icons/legend.svg" alt="" width="18" height="18" className="size-[18px] shrink-0" />
        <h2 className="font-display m-0 flex-1 text-[13px] leading-[1.4] font-semibold text-ink">Legend</h2>
        <img src="/assets/icons/chevron-up.svg" alt="" width="11" height="6" className={`transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
      {open && (
        <>
          <div className="h-px w-[268px] bg-divider" />
          <p className="m-0 whitespace-nowrap text-[11px] leading-[1.4] font-bold tracking-[0.66px] text-muted">{focusedGenre ? `${GENRE_BY_KEY[focusedGenre].name} · SUBGENRES` : 'DOT COLOUR = GENRE'}</p>
          <div className="flex w-full flex-wrap gap-x-[8px] gap-y-[7px]">
            {entries.map((g) => (
              <div key={g.key} data-subgenre-key={focusedGenre ? g.key : undefined} className="flex w-[130px] items-center gap-[7px]">
                <span className="size-[9px] shrink-0 rounded-full" style={{ background: g.dot }} />
                <p className="m-0 flex-1 text-[10px] leading-[1.4] text-ink-2">{g.name}</p>
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-divider" />
          <div className="flex w-full items-center gap-[9px]">
            <span className="size-[10px] shrink-0 rounded-full bg-[var(--lrm-raw-9c9a98)]" />
            <p className="m-0 whitespace-nowrap text-[12px] leading-[1.4] text-ink-2">One dot = one artist</p>
          </div>

        </>
      )}
    </section>
  )
}

/** Map walkthrough, available to guests and signed-in visitors. */
export function WelcomeGuide({ onClose, signedIn = false }) {
  const STEPS = [
    { title: 'Click on the dots', body: 'One dot, one artist. Find new artists' },
    { title: SHARED_AUDIENCES.length ? 'Follow the lines' : 'Explore nearby artists', body: SHARED_AUDIENCES.length ? 'Follow a connection to explore a nearby artist.' : 'Audience links have been cleared. Any future rebuild will favour nearby dots, without guaranteeing a connection.' },
    { title: 'Explore a genre', body: 'Choose a genre to zoom into its artists and reveal subgenres. Search finds artists by name.' },
    { title: 'Open anything', body: 'Click a dot to open its artist card and profile. Recentre resets the view.' },
  ]
  return (
    <aside aria-label="How to read this map" className="relative w-[400px] animate-pop rounded-panel border border-line bg-surface px-[23px] pb-[24px] pt-[23px] shadow-panel">
      <button type="button" onClick={onClose} aria-label="Close the guide" className="absolute right-[14px] top-[12px] flex size-[28px] items-center justify-center rounded-full text-[20px] leading-none text-muted hover:bg-soft">×</button>
      <p className="m-0 text-[11px] leading-[15px] font-bold text-muted">HOW TO READ THIS MAP</p>
      <h1 className="font-display m-0 mt-[10px] text-[24px] leading-[32px] font-semibold text-ink-2">Your 4-step guide to the web of dots.</h1>
      <p className="m-0 mt-[12px] text-[14px] leading-[22px] text-muted">Explore {ARTISTS.length} artists across seven scenes. {SHARED_AUDIENCES.length ? 'Follow the lines to discover shared audiences.' : 'Audience connections are currently cleared.'}</p>
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
      {signedIn ? (
        <button type="button" onClick={onClose} className="mt-[24px] flex h-[48px] w-full items-center justify-center rounded-control bg-accent text-[15px] font-semibold text-on-accent hover:bg-accent-hover">Start exploring</button>
      ) : (
        <>
          <div className="mt-[24px] h-px bg-divider" />
          <Link to={ROUTES.signup} className="mt-[21px] flex h-[48px] items-center justify-center rounded-control bg-accent text-[15px] font-semibold text-on-accent hover:bg-accent-hover">Create an account</Link>
          <Link to={ROUTES.login} className="mt-[12px] flex h-[48px] items-center justify-center rounded-control border border-line text-[15px] font-semibold text-ink-2 hover:bg-wash">Log in</Link>
          <p className="m-0 mt-[16px] text-[12px] leading-[17px] text-muted">Keep browsing as a guest — this guide stays available from the ? Help icon on the map.</p>
        </>
      )}
    </aside>
  )
}

/** Original song-playlist layout; demo previews do not play audio or create releases. */
export function RecommendedPanel({ onClose, closeTo, rows = recommendedSongsFor(ARTISTS), activePreview, onTogglePreview, onJumpToArtist }) {
  const [localPreview, setLocalPreview] = useState(null)
  const playing = activePreview === undefined ? localPreview : activePreview
  const togglePreview = onTogglePreview ?? (track => setLocalPreview(current =>
    current?.artistId === track.artistId && current.title === track.title ? null : track))
  const extraHeight = Math.max(0, rows.length - 6) * 72
  const CloseTag = closeTo ? Link : 'button'
  return (
    <aside aria-label="Recommended songs" style={{ overflowY: extraHeight ? 'auto' : undefined }} className="relative h-[560px] w-[288px] animate-pop rounded-panel bg-surface shadow-panel ring-1 ring-inset ring-line">
      <h2 className="font-display absolute left-[20px] top-[20px] m-0 text-[16px] font-semibold text-ink">Recommended for you</h2>
      <p className="absolute left-[20px] top-[44px] m-0 text-[11px] text-muted">Discover playlist · demo tracks</p>
      <CloseTag to={closeTo} type={closeTo ? undefined : 'button'} onClick={onClose} aria-label="Close recommendations" className="absolute right-[18px] top-[18px] flex size-[24px] items-center justify-center rounded-control border border-line text-muted hover:bg-soft focus-visible:outline-2 focus-visible:outline-accent">×</CloseTag>
      <ol className="m-0 list-none p-0">
        {rows.map(({ title, artist }, index) => {
          const active = playing?.artistId === artist.id && playing.title === title
          const subgenre = SUBGENRE_BY_ID[artist.subgenreIds[0]]
          return (
            <li key={artist.id} className="absolute left-[20px] h-[64px] w-[248px] border-b border-divider" style={{ top: 76 + index * 72 }}>
              <button type="button" onClick={() => togglePreview({ artistId: artist.id, title })} aria-label={`${active ? 'Pause' : 'Play'} ${title}`} aria-pressed={active}
                className={`absolute left-0 top-0 flex size-[44px] items-center justify-center rounded-control focus-visible:outline-2 focus-visible:outline-accent ${active ? 'bg-brand-tint text-brand' : 'bg-soft text-ink hover:bg-line'}`}>
                {active
                  ? <span aria-hidden="true" className="flex h-[22px] items-end gap-[3px]">{[0, 1, 2].map(bar => <i key={bar} className="block h-full w-[4px] origin-bottom animate-eq bg-current motion-reduce:animate-none" style={{ animationDelay: `${-bar * 0.3}s` }} />)}</span>
                  : <svg width="15" height="18" viewBox="0 0 24 28" aria-hidden="true"><path d="M0 0L24 14L0 28Z" fill="currentColor" /></svg>}
              </button>
              <Link to={`/artists/${artist.id}`} title={`${title} · ${artist.name}`} className="absolute left-[56px] right-0 top-[4px] truncate text-[13px] font-semibold text-ink hover:underline">{title}</Link>
              <span title={`${artist.name} · ${subgenre.label}`} className="absolute left-[56px] right-0 top-[23px] truncate text-[11px] text-muted">{artist.name} · {subgenre.label}</span>
              <button type="button" onClick={() => onJumpToArtist?.(artist.id)} aria-label={`Jump to ${artist.name}`} title="Jump to artist"
                className="absolute left-[56px] top-[40px] h-[20px] rounded-control text-[11px] font-medium text-ink underline underline-offset-2 hover:text-brand focus-visible:outline-2 focus-visible:outline-accent">
                Jump to artist
              </button>
            </li>
          )
        })}
      </ol>
      <Link to="/artists" style={{ top: 508 + extraHeight }} className="absolute left-[20px] text-[12px] font-semibold text-ink hover:underline">Explore all artists →</Link>
    </aside>
  )
}

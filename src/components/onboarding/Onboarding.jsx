import { useState } from 'react'
import Link from '@/components/AppLink'
import { GENRE_BY_KEY, ROUTES } from '@/data'
import { useToast } from '@/lib/toast'

// Shared pieces of 📸 5, 📸 6 and the manual taste-profile screen.
// Coordinates are the Figma frame's, measured from below the 72px nav bar.

export function OnboardingHeader({ title, subtitle }) {
  return (
    <>
      <Link to={ROUTES.forYou} className="absolute left-[1327px] top-[28px] whitespace-nowrap text-[12px] leading-normal font-semibold text-ink hover:underline">Skip for now</Link>
      <h1 className="font-display absolute left-1/2 top-[44px] m-0 w-[560px] -translate-x-1/2 text-center text-[30px] leading-normal font-semibold text-ink">{title}</h1>
      <p className="absolute left-1/2 top-[88px] m-0 w-[660px] -translate-x-1/2 text-center text-[14px] leading-normal text-muted">{subtitle}</p>
    </>
  )
}

export const MAIN_GENRES = [
  { key: 'indie', x: 23, y: 75 }, { key: 'pop', x: 263, y: 75 },
  { key: 'mandopop', x: 23, y: 113 }, { key: 'electronic', x: 263, y: 113 },
  { key: 'hiphop', x: 23, y: 151 }, { key: 'ethnic', x: 263, y: 151 },
]
export const SUBGENRES = [
  { name: 'House', genre: 'electronic', x: 23, y: 221, w: 73 },
  { name: 'Techno', genre: 'electronic', x: 104, y: 221, w: 78 },
  { name: 'Synthwave', genre: 'electronic', x: 190, y: 221, w: 101 },
  { name: 'Drum & Bass', genre: 'electronic', x: 299, y: 221, w: 109 },
  { name: 'Alt-Pop', genre: 'pop', x: 416, y: 221, w: 79 },
  { name: 'Lo-fi Hip-Hop', genre: 'hiphop', x: 23, y: 253, w: 114 },
  { name: 'Post-Rock', genre: 'indie', x: 145, y: 253, w: 95 },
  { name: 'Gamelan', genre: 'ethnic', x: 248, y: 253, w: 86 },
  { name: 'Mandopop Ballads', genre: 'mandopop', x: 342, y: 253, w: 141 },
]
const SUB_NAMES = new Set(SUBGENRES.map((s) => s.name))

/** Picked names in display order: main genres first, then subgenres. */
export function orderedPicks(selected) {
  return [
    ...MAIN_GENRES.map((m) => GENRE_BY_KEY[m.key].name).filter((n) => selected.includes(n)),
    ...SUBGENRES.map((s) => s.name).filter((n) => selected.includes(n)),
  ]
}

export function genreSummary(selected, style) {
  const subs = selected.filter((n) => SUB_NAMES.has(n)).length
  const mains = selected.length - subs
  if (!selected.length) return 'Nothing picked yet'
  if (style === 'bold') return `${selected.length} genre${selected.length === 1 ? '' : 's'} selected`
  return `${selected.length} selected · ${mains} genre${mains === 1 ? '' : 's'}, ${subs} subgenre${subs === 1 ? '' : 's'}`
}

/**
 * Figma "card / Pick your genres" (520 × 340). Click a chip to pick or unpick it.
 *   chipStyle "dark" → picked chips turn black (📸 6)
 *   chipStyle "bold" → picked chips stay white with bold text (manual taste profile)
 */
export function GenreCard({ x, y, title, selected, onToggle, chipStyle, dotOverrides = {} }) {
  const dot = (name, key) => dotOverrides[name] ?? GENRE_BY_KEY[key].dot
  return (
    <div className="absolute h-[340px] w-[520px] overflow-clip rounded-card border border-line bg-surface" style={{ left: x, top: y }}>
      <p className="absolute left-[23px] top-[23px] m-0 whitespace-nowrap text-[16px] leading-normal font-semibold text-ink">{title}</p>
      <p className="absolute left-[23px] top-[47px] m-0 whitespace-nowrap text-[12px] leading-normal text-subtle">These are the clusters on your Discover map.</p>

      {MAIN_GENRES.map((c) => {
        const g = GENRE_BY_KEY[c.key]
        const on = selected.includes(g.name)
        const dark = on && chipStyle === 'dark'
        return (
          <button key={c.key} type="button" aria-pressed={on} onClick={() => onToggle(g.name)}
            className={`absolute block h-[34px] w-[232px] rounded-[17px] text-left transition-colors ${dark ? 'bg-accent-tint' : `border bg-surface hover:bg-wash ${on ? 'border-accent' : 'border-line'}`}`}
            style={{ left: c.x, top: c.y }}>
            <span className={`absolute size-[8px] rounded-full ${dark ? 'left-[14px] top-[13px]' : 'left-[13px] top-[12px]'}`} style={{ background: dot(g.name, c.key) }} />
            <span className={`absolute whitespace-nowrap text-[12px] leading-normal ${dark ? 'left-[30px] top-[10px] font-semibold text-brand' : `left-[29px] top-[9px] text-ink ${on ? 'font-semibold' : ''}`}`}>{g.name}</span>
          </button>
        )
      })}

      <p className="absolute left-[23px] top-[197px] m-0 whitespace-nowrap text-[12px] leading-normal font-semibold text-subtle">Narrow it down — optional</p>
      {SUBGENRES.map((c) => {
        const on = selected.includes(c.name)
        const dark = on && chipStyle === 'dark'
        return (
          <button key={c.name} type="button" aria-pressed={on} onClick={() => onToggle(c.name)}
            className={`absolute block h-[26px] rounded-[13px] text-left transition-colors ${dark ? 'bg-accent-tint' : `border bg-surface hover:bg-wash ${on ? 'border-accent' : 'border-line'}`}`}
            style={{ left: c.x, top: c.y, width: c.w }}>
            <span className={`absolute size-[6px] rounded-full ${dark ? 'left-[12px] top-[10px]' : 'left-[11px] top-[9px]'}`} style={{ background: dot(c.name, c.genre) }} />
            <span className={`absolute whitespace-nowrap text-[12px] leading-normal ${dark ? 'left-[24px] top-[6px] font-semibold text-brand' : `left-[23px] top-[5px] text-ink ${on ? 'font-semibold' : ''}`}`}>{c.name}</span>
          </button>
        )
      })}

      <p className="absolute left-[23px] top-[299px] m-0 whitespace-nowrap text-[12px] leading-normal text-muted">{genreSummary(selected, chipStyle)}</p>
    </div>
  )
}

export const SONGS = [
  { title: 'Tracks of the Woods', sub: 'FallingIslands · Synthwave' },
  { title: 'Slow Burn', sub: 'Lullaboy · Pop Music' },
  { title: 'Night Lamp', sub: 'Sherman Zhuo · Contemporary Mandopop' },
  { title: 'Low Tide', sub: 'FallingIslands · Synthwave' },
  { title: 'Midnight Transit', sub: 'Evanturetime · EDM' },
  { title: 'Coastline', sub: 'Marian Carmel · Alt-pop' },
  { title: 'Kampong Bass', sub: 'Fauxe · EDM' },
  { title: 'Gamelan on the Lawn', sub: 'Loka Nada · Traditional' },
]

/** Figma "card / Pick your songs" (520 × 340). Search, preview (▶) and add/remove tracks. */
export function SongCard({ x, y, title, added, onToggle }) {
  const [q, setQ] = useState('')
  const [preview, setPreview] = useState(null)
  const toast = useToast()
  const term = q.trim().toLowerCase()
  const list = (term ? SONGS.filter((s) => `${s.title} ${s.sub}`.toLowerCase().includes(term)) : SONGS.slice(0, 3)).slice(0, 3)

  return (
    <div className="absolute h-[340px] w-[520px] overflow-clip rounded-card border border-line bg-surface" style={{ left: x, top: y }}>
      <p className="absolute left-[23px] top-[23px] m-0 whitespace-nowrap text-[16px] leading-normal font-semibold text-ink">{title}</p>
      <p className="absolute left-[23px] top-[47px] m-0 whitespace-nowrap text-[12px] leading-normal text-subtle">Preview a track, then add it to your profile.</p>

      <label className="absolute left-[23px] top-[79px] block h-[42px] w-[472px] rounded-control bg-soft focus-within:ring-2 focus-within:ring-accent">
        <img src="/assets/icons/glass.svg" alt="" width="12" height="12" className="absolute left-[16px] top-[15px]" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a song or artist" aria-label="Search a song or artist"
          className="absolute left-[40px] top-[12px] w-[400px] bg-transparent p-0 text-[13px] leading-normal text-ink outline-none placeholder:text-subtle" />
      </label>

      {list.length === 0 && <p className="absolute left-[23px] top-[145px] m-0 text-[13px] text-subtle">No songs match “{q.trim()}”.</p>}
      {list.map((s, i) => {
        const t = 139 + i * 44
        const on = added.includes(s.title)
        const playing = preview === s.title
        return (
          <div key={s.title}>
            <div className="absolute left-[23px] size-[32px] rounded-[6px] bg-line" style={{ top: t }} />
            <p className="absolute left-[65px] m-0 whitespace-nowrap text-[13px] leading-normal font-semibold text-ink" style={{ top: t + 2 }}>{s.title}</p>
            <p className="absolute left-[65px] m-0 whitespace-nowrap text-[11px] leading-normal text-subtle" style={{ top: t + 18 }}>{s.sub}</p>
            <button type="button" aria-label={playing ? `Stop preview of ${s.title}` : `Preview ${s.title}`}
              onClick={() => { setPreview(playing ? null : s.title); if (!playing) toast(`Previewing “${s.title}”`) }}
              className={`absolute left-[393px] flex size-[26px] items-center justify-center rounded-[13px] border text-[9px] ${playing ? 'border-accent bg-accent-tint text-brand' : 'border-line bg-surface text-subtle hover:border-faint'}`}
              style={{ top: t + 4 }}>{playing ? '❚❚' : '▶'}</button>
            <button type="button" aria-pressed={on} onClick={() => onToggle(s.title)}
              className={`absolute left-[427px] h-[26px] w-[68px] rounded-[13px] text-[11px] leading-normal font-semibold ${on ? 'bg-accent-tint text-brand' : 'border border-line bg-surface text-ink hover:border-faint'}`}
              style={{ top: t + 4 }}>{on ? 'Added' : '+ Add'}</button>
          </div>
        )
      })}

      <p className="absolute left-[23px] top-[299px] m-0 whitespace-nowrap text-[12px] leading-normal text-muted">{added.length} song{added.length === 1 ? '' : 's'} added</p>
    </div>
  )
}

/** Toggle a value in a list kept in state. */
export const toggleIn = (setList) => (value) =>
  setList((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]))

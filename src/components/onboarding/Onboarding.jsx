import { useState } from 'react'
import Link from '@/components/AppLink'
import { GENRES, SUBGENRES as CATALOGUE_SUBGENRES, GENRE_BY_KEY, ROUTES } from '@/data'
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

// Adapt the catalogue for existing onboarding and Discover chip consumers.
export const MAIN_GENRES = GENRES.map((genre) => ({ ...genre }))
export const SUBGENRES = CATALOGUE_SUBGENRES.map((genre) => ({
  ...genre,
  name: genre.label,
  genre: genre.familyId,
  dot: genre.colour.css,
}))
const SUB_NAMES = new Set(SUBGENRES.map((s) => s.name))

/** Picked names in display order: main genres first, then subgenres. */
export function orderedPicks(selected) {
  return [
    ...MAIN_GENRES.map((m) => GENRE_BY_KEY[m.key].name).filter((n) => selected.includes(n)),
    ...SUBGENRES.map((s) => s.name).filter((n) => selected.includes(n)),
  ]
}

/** A taste profile is a set of coloured genre and subgenre names, not a ranking. */
export function TasteProfile({ selected }) {
  const profile = orderedPicks(selected).map((name) => {
    const genre = MAIN_GENRES.find((genre) => genre.name === name)
      ?? SUBGENRES.find((genre) => genre.name === name)
    return { name, dot: genre.dot }
  })

  return (
    <section aria-label="Your taste profile" className="flex min-h-[72px] items-center gap-[24px] rounded-card border border-line bg-soft px-[23px] py-[16px]">
      <div className="w-[300px] shrink-0 leading-normal">
        <p className="m-0 text-[10px] font-semibold text-subtle">YOUR TASTE PROFILE</p>
        <p className="m-0 mt-[6px] text-[12px] text-muted">Updates as you pick. You can change it any time.</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap gap-[10px]" aria-live="polite">
        {profile.length ? profile.map((genre) => (
          <span key={genre.name} className="inline-flex min-h-[30px] items-center gap-[6px] rounded-[15px] border border-line bg-surface px-[11px] text-[12px] text-ink">
            <span aria-hidden="true" className="size-[8px] shrink-0 rounded-full" style={{ background: genre.dot }} />
            {genre.name}
          </span>
        )) : <span className="text-[13px] text-subtle">Pick at least one genre or subgenre.</span>}
      </div>
    </section>
  )
}

export function genreSummary(selected, style) {
  const subs = selected.filter((n) => SUB_NAMES.has(n)).length
  const mains = selected.length - subs
  if (!selected.length) return 'Nothing picked yet'
  if (style === 'bold') return `${selected.length} genre${selected.length === 1 ? '' : 's'} selected`
  return `${selected.length} selected · ${mains} genre${mains === 1 ? '' : 's'}, ${subs} subgenre${subs === 1 ? '' : 's'}`
}

/** Fixed-size companion to SongCard; children scroll without growing the frame. */
export function GenreCard({ x, y, title, selected, onToggle, chipStyle }) {
  function chip(genre, child = false) {
    const on = selected.includes(genre.name) || (!child && SUBGENRES.some(item => item.genre === genre.key && selected.includes(item.name)))
    const dark = on && chipStyle === 'dark'
    return (
      <button key={genre.id ?? genre.key} type="button" aria-pressed={on} onClick={() => onToggle(genre.name)}
        className={`inline-flex shrink-0 items-center gap-[6px] rounded-full border px-[10px] text-left text-[12px] leading-normal transition-colors ${child ? 'min-h-[26px]' : 'min-h-[30px]'} ${dark ? 'border-accent bg-accent-tint font-semibold text-brand' : `bg-surface text-ink hover:bg-wash ${on ? 'border-accent font-semibold' : 'border-line'}`}`}>
        <span aria-hidden="true" className={`${child ? 'size-[6px]' : 'size-[8px]'} shrink-0 rounded-full`} style={{ background: genre.dot }} />
        {genre.name}
      </button>
    )
  }

  return (
    <div className="absolute flex h-[340px] w-[520px] flex-col overflow-clip rounded-card border border-line bg-surface px-[23px] py-[20px]" style={{ left: x, top: y }}>
      <p className="m-0 text-[16px] leading-normal font-semibold text-ink">{title}</p>
      <p className="m-0 mt-[3px] text-[12px] leading-normal text-subtle">These are the clusters on your Discover map.</p>
      <div role="group" aria-label="Genre families" className="mt-[10px] flex shrink-0 flex-wrap gap-[6px]">
        {MAIN_GENRES.map((genre) => chip(genre))}
      </div>
      <p className="m-0 mb-[6px] mt-[10px] text-[12px] leading-normal font-semibold text-subtle">Narrow it down — optional</p>
      <div role="group" aria-label="Subgenres and variants" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto pr-[4px]">
        <div className="flex flex-wrap gap-[6px] pb-[4px]">
          {SUBGENRES.map((genre) => chip(genre, true))}
        </div>
      </div>
      <p className="m-0 mt-[10px] shrink-0 text-[12px] leading-normal text-muted">{genreSummary(selected, chipStyle)}</p>
    </div>
  )
}

export const SONGS = [
  { title: 'Tracks of the Woods', sub: 'DJ Beatroot · Synthwave' },
  { title: 'Slow Burn', sub: 'Lullaboy · Pop Music' },
  { title: 'Night Lamp', sub: 'Sherman Zhuo · Contemporary Mandopop' },
  { title: 'Low Tide', sub: 'DJ Beatroot · Synthwave' },
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

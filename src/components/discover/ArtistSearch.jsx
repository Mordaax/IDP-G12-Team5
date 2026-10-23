import { useState } from 'react'
import { useGo } from '@/components/AppLink'
import { ARTISTS, GENRE_BY_KEY, SUBGENRE_BY_ID } from '@/data'

// Search box on the Discover map. Suggests artists as you type.
// Profiles are readable by guests; following still requires an account.
export default function ArtistSearch({ signedIn, placeholder, className = '', inputClass = '', icon }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useGo()

  const term = q.trim().toLowerCase()
  const matches = term
    ? ARTISTS.filter(a => [a.name, GENRE_BY_KEY[a.primaryGenreId].name, ...a.subgenreIds.map(id => SUBGENRE_BY_ID[id].label), ...a.languages].join(' ').toLowerCase().includes(term)).slice(0, 6)
    : []

  const pick = (a) => {
    setOpen(false)
    navigate(`/artists/${a.id}`)
  }

  return (
    <div className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); if (matches[0]) pick(matches[0]) }}
        className="flex size-full items-center gap-[10px]"
      >
        {icon}
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`w-full min-w-0 bg-transparent p-0 text-[13px] leading-[1.4] text-ink outline-none ${inputClass}`}
        />
      </form>
      {open && term && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 m-0 list-none animate-pop overflow-hidden rounded-card border border-line bg-surface p-[4px] shadow-pop">
          {matches.length ? matches.map((a) => (
            <li key={a.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(a)} className="flex w-full items-center justify-between rounded-control px-[10px] py-[8px] text-left text-[13px] text-ink hover:bg-soft">
                <span className="font-medium">{a.name}</span>
                <span className="text-[11px] text-muted">{SUBGENRE_BY_ID[a.subgenreIds[0]].label}</span>
              </button>
            </li>
          )) : <li className="px-[10px] py-[8px] text-[12px] text-muted">No artists match “{q.trim()}”</li>}
        </ul>
      )}
    </div>
  )
}

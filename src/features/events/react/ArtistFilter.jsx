import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Avatar } from './EventParts'
import { useEvents } from './EventsContext'
import { searchArtists } from './eventModel'

export default function ArtistFilter() {
  const filters = useEvents()
  const { artists, draft } = filters
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [position, setPosition] = useState(null)
  const input = useRef(null)
  const popup = useRef(null)
  const id = useId()
  const matches = useMemo(() => searchArtists(artists, query, draft.artists), [artists, query, draft.artists])
  const artistById = useMemo(() => new Map(artists.map((artist) => [artist.id, artist])), [artists])
  const visible = open && !!query.trim()

  // Portal escapes the filter panel's scroll clipping, while staying anchored to the input.
  useLayoutEffect(() => {
    if (!visible) return
    const place = () => {
      const rect = input.current.parentElement.getBoundingClientRect()
      const side = input.current.closest('.events-shell__sidebar').getBoundingClientRect().right
      const container = input.current.closest('.events-filters__fields').getBoundingClientRect()
      if (!rect.width || rect.bottom <= container.top || rect.top >= container.bottom) { setOpen(false); return }
      const width = Math.min(280, window.innerWidth - 24)
      const height = Math.min(matches.length ? matches.length * 54 + 52 : 80, window.innerHeight - 24)
      const beside = side + width + 12 <= window.innerWidth - 12
      const left = beside ? side + 12 : Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))
      const top = beside ? Math.max(12, Math.min(rect.top, window.innerHeight - height - 12))
        : rect.bottom + height + 8 <= window.innerHeight - 12 ? rect.bottom + 8 : Math.max(12, rect.top - height - 8)
      setPosition({ left, top, width, maxHeight: window.innerHeight - top - 12 })
    }
    place()
    window.addEventListener('resize', place)
    document.addEventListener('scroll', place, true)
    return () => { window.removeEventListener('resize', place); document.removeEventListener('scroll', place, true) }
  }, [visible, matches.length])

  useEffect(() => {
    if (!visible) return
    const dismiss = (event) => { if (!input.current?.parentElement.contains(event.target) && !popup.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [visible])

  const select = (artist) => {
    if (!draft.artists.includes(artist.id)) filters.updateDraft({ artists: [...draft.artists, artist.id] })
    setQuery('')
    setOpen(false)
    setActive(0)
    input.current.focus({ preventScroll: true })
  }
  const onKeyDown = (event) => {
    if (event.key === 'Escape' || event.key === 'Tab') { setOpen(false); return }
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length) {
      event.preventDefault()
      setOpen(true)
      setActive((index) => (index + (event.key === 'ArrowDown' ? 1 : matches.length - 1)) % matches.length)
    } else if (event.key === 'Enter' && visible && matches[active]) { event.preventDefault(); select(matches[active]) }
  }

  return <section className="events-filters__group artist-filter">
    <h2>Artists</h2>
    <div className="artist-filter__search">
      <span aria-hidden="true">⌕</span>
      <input ref={input} type="search" role="combobox" aria-label="Search artists" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={visible} aria-controls={visible ? id : undefined} aria-activedescendant={visible && matches[active] ? `${id}-${matches[active].id}` : undefined} placeholder="Search artist names" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(0) }} onFocus={() => { if (query.trim()) setOpen(true) }} onKeyDown={onKeyDown} />
      {query && <button type="button" aria-label="Clear artist search" onClick={() => { setQuery(''); setOpen(false); input.current.focus() }}>×</button>}
    </div>
    <div className="artist-filter__badges" role="group" aria-label="Selected artists">
      {draft.artists.map((artistId) => {
        const artist = artistById.get(artistId)
        const name = artist?.name || artistId
        return <span key={artistId} className="artist-filter__badge"><span>{name}</span><button type="button" aria-label={`Remove ${name}`} onClick={() => { filters.toggleDraft('artists', artistId); input.current.focus({ preventScroll: true }) }}>×</button></span>
      })}
    </div>
    {visible && position && createPortal(<div ref={popup} className="artist-filter__popup" style={position}>
      <div id={id} role="listbox" aria-label="Artist search results">
        {matches.map((artist, index) => <button key={artist.id} id={`${id}-${artist.id}`} type="button" role="option" aria-selected={index === active} tabIndex={-1} onPointerDown={(event) => event.preventDefault()} onMouseMove={() => setActive(index)} onClick={() => select(artist)}>
          <Avatar name={artist.name} hue={artist.hue} size={30} /><span>{artist.name}</span><small>{artist.eventCount} event{artist.eventCount === 1 ? '' : 's'}</small>
        </button>)}
      </div>
      {!matches.length ? <p role="status">No matching artists</p> : <p>Up to 5 matches · Keep typing to narrow your search</p>}
    </div>, document.body)}
  </section>
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { useToast } from '@/lib/toast'
import EventMap from './EventMap'
import GenreOptions from './GenreOptions'
import { ListCard, MapCard } from './EventParts'
import ArtistFilter from './ArtistFilter'
import { useEvents } from './EventsContext'
import { readEventQuery, SORTS } from './eventModel'

function EventSearch() {
  const filters = useEvents()
  const toast = useToast()
  const [listening, setListening] = useState(false)
  const recognition = useRef(null)
  const searchInput = useRef(null)
  const { draft } = filters
  const toggleVoice = () => {
    if (listening) { recognition.current?.stop(); return }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { toast('Voice search is not supported in this browser'); return }
    const instance = new SpeechRecognition()
    instance.lang = 'en-SG'
    instance.interimResults = false
    instance.onresult = (event) => filters.setQuery(event.results[0][0].transcript)
    instance.onerror = () => toast('Could not hear that, try again')
    instance.onend = () => setListening(false)
    recognition.current = instance
    setListening(true)
    instance.start()
  }
  useEffect(() => () => recognition.current?.abort(), [])
  return <div className="events-search">
    <span aria-hidden="true">⌕</span>
    <input ref={searchInput} type="search" value={draft.q} placeholder="Search" aria-label="Search events, artists or venues" onChange={(event) => filters.setQuery(event.target.value)} />
    {draft.q && <button type="button" aria-label="Clear search" onClick={() => { filters.setQuery(''); searchInput.current?.focus() }}>×</button>}
    <button type="button" aria-label={listening ? 'Stop voice search' : 'Search by voice'} aria-pressed={listening} onClick={toggleVoice}>♩</button>
  </div>
}

function FilterSidebar({ onApplied }) {
  const filters = useEvents()
  const { draft, genres, events, dirty, dateError } = filters
  const genreCounts = useMemo(() => Object.fromEntries(genres.map((genre) => [genre.id, events.filter((event) => event.genreId === genre.id).length])), [genres, events])

  return <aside className="events-filters" aria-label="Event filters">
    <p className="events-filters__results" role="status" aria-label="Search results" aria-live="polite">{filters.loading ? 'Loading events…' : filters.error ? 'Results unavailable' : `${filters.results.length} result${filters.results.length === 1 ? '' : 's'}`}</p>
    <div className="events-filters__actions">
      <div className="events-filters__reset-wrap">
        <button type="button" className="events-filters__reset" aria-label="Reset filters" aria-describedby="reset-filters-tooltip" onClick={filters.reset}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></svg></button>
        <span id="reset-filters-tooltip" className="events-filters__tooltip" role="tooltip">reset filters</span>
      </div>
      <button type="button" className="events-filters__apply" disabled={!dirty || !!dateError} onClick={() => { filters.apply(); onApplied() }}>Apply filters</button>
    </div>

    <div className="events-filters__fields" role="region" aria-label="Filter options" tabIndex={0}>
    <section className="events-filters__group">
      <h2>Genre</h2>
      <GenreOptions>
        {genres.map((genre) => <label key={genre.id} className="events-filters__option"><input type="checkbox" checked={draft.genres.includes(genre.id)} onChange={() => filters.toggleDraft('genres', genre.id)} /><span>{genre.label}</span><small>{genreCounts[genre.id] || 0}</small></label>)}
      </GenreOptions>
    </section>

    <ArtistFilter />

    <section className="events-filters__group">
      <h2>Date range</h2>
      <div className="events-date-range">
        <label>From<input type="date" aria-label="Start date" aria-describedby="events-date-range-help" aria-invalid={!!dateError} value={draft.startDate} max={draft.endDate || undefined} onChange={(event) => filters.updateDraft({ startDate: event.target.value })} /></label>
        <label>To<input type="date" aria-label="End date" aria-describedby="events-date-range-help" aria-invalid={!!dateError} value={draft.endDate} min={draft.startDate || undefined} onChange={(event) => filters.updateDraft({ endDate: event.target.value })} /></label>
      </div>
      <p id="events-date-range-help" className={`events-date-range__hint${dateError ? ' is-error' : ''}`} role={dateError ? 'alert' : undefined}>{dateError || 'Leave dates blank for all upcoming events.'}</p>
    </section>
    </div>
  </aside>
}

export function EventsShell({ view, children, listTo = '/events/list' }) {
  const filters = useEvents()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const count = filters.results.length
  return <Page active="events" className="react-events events-browse">
    <main aria-label="Events" className={`events-shell ${view === 'map' ? 'is-map' : ''} ${filtersOpen ? 'filters-open' : ''}`}>
      <button className="events-shell__filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="events-filters" onClick={() => setFiltersOpen((open) => !open)}>☷ Filters {filters.activeCount > 0 && <span>{filters.activeCount}</span>}</button>
      <div className="events-shell__body">
        <div id="events-filters" className={`events-shell__sidebar ${filtersOpen ? 'is-open' : ''}`}><FilterSidebar onApplied={() => setFiltersOpen(false)} /></div>
        <section className="events-shell__main">
          <section className="events-shell__toolbar" aria-label="Event search and sort"><EventSearch /><label className="events-sort"><span className="events-sort__label">Sort by</span><select aria-label="Sort events" value={filters.sort} onChange={(event) => filters.setSort(event.target.value)}>{SORTS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}</select></label><div className="view-toggle" role="group" aria-label="Events view"><Link to="/events/map" className={view === 'map' ? 'is-active' : ''} aria-current={view === 'map' ? 'page' : undefined}>Map</Link><Link to={listTo} className={view === 'list' ? 'is-active' : ''} aria-current={view === 'list' ? 'page' : undefined}>List</Link></div></section>
          {filters.applied.venue && <button type="button" className="events-shell__chip" onClick={filters.clearVenue}>At {filters.venueName} ×</button>}
          {filters.loading ? <div className="events-shell__state" role="status">Loading events…</div>
            : filters.error ? <div className="events-shell__state"><p>{filters.error}</p><button type="button" onClick={filters.load}>Try again</button></div>
            : !count ? <div className="events-shell__state"><h2>No events match these filters</h2><p>Try a wider date range or fewer genres.</p><button type="button" onClick={filters.reset}>Reset filters</button></div>
            : children}
        </section>
      </div>
    </main>
  </Page>
}

export function EventsList() {
  const { results } = useEvents()
  return <EventsShell view="list"><div className="events-list__grid">{results.map((event) => <ListCard key={event.id} event={event} />)}</div></EventsShell>
}

export function EventsMap() {
  const { results, genres, user } = useEvents()
  const { search } = useLocation()
  const requestedId = readEventQuery(search).event
  const focusedEvent = results.find((event) => event.id === requestedId)
  const [selectedId, setSelectedId] = useState(null)
  const [hoverId, setHoverId] = useState(null)
  const cards = useRef(null)
  const [scrollable, setScrollable] = useState({ back: false, forward: false })
  const select = useCallback((id) => {
    setSelectedId((current) => current === id ? null : id)
    cards.current?.querySelector(`[data-event-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [])
  useEffect(() => {
    if (!focusedEvent) return
    setSelectedId(focusedEvent.id)
    cards.current?.querySelector(`[data-event-id="${focusedEvent.id}"]`)?.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' })
  }, [focusedEvent])
  useEffect(() => {
    const strip = cards.current
    if (!strip) return
    strip.scrollTo({ left: 0, behavior: 'instant' })
    const update = () => setScrollable({ back: strip.scrollLeft > 1, forward: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1 })
    const wheel = (event) => {
      if (event.ctrlKey || event.metaKey || strip.scrollWidth <= strip.clientWidth) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!delta) return
      event.preventDefault()
      strip.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? strip.clientWidth : 1)
    }
    // Click-and-drag with a mouse (touch and trackpads already scroll natively).
    const drag = { id: null, startX: 0, startLeft: 0, moved: false, suppressClick: false }
    const pointerDown = (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || strip.scrollWidth <= strip.clientWidth) return
      drag.id = event.pointerId
      drag.startX = event.clientX
      drag.startLeft = strip.scrollLeft
      drag.moved = false
    }
    const pointerMove = (event) => {
      if (event.pointerId !== drag.id) return
      const dx = event.clientX - drag.startX
      if (!drag.moved) {
        if (Math.abs(dx) < 5) return
        drag.moved = true
        strip.setPointerCapture(event.pointerId)
        strip.classList.add('is-dragging')
      }
      event.preventDefault()
      strip.scrollLeft = drag.startLeft - dx
    }
    const pointerEnd = (event) => {
      if (event.pointerId !== drag.id) return
      if (drag.moved) {
        drag.suppressClick = true
        strip.classList.remove('is-dragging')
        if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId)
        setTimeout(() => { drag.suppressClick = false }, 0)
      }
      drag.id = null
    }
    // A drag should not also open the event card it started on.
    const clickAfterDrag = (event) => {
      if (!drag.suppressClick) return
      event.preventDefault()
      event.stopPropagation()
      drag.suppressClick = false
    }
    const stopNativeDrag = (event) => event.preventDefault()
    strip.addEventListener('scroll', update, { passive: true })
    strip.addEventListener('wheel', wheel, { passive: false })
    strip.addEventListener('pointerdown', pointerDown)
    strip.addEventListener('pointermove', pointerMove)
    strip.addEventListener('pointerup', pointerEnd)
    strip.addEventListener('pointercancel', pointerEnd)
    strip.addEventListener('click', clickAfterDrag, true)
    strip.addEventListener('dragstart', stopNativeDrag)
    const observer = new ResizeObserver(update)
    observer.observe(strip)
    update()
    return () => {
      strip.removeEventListener('scroll', update)
      strip.removeEventListener('wheel', wheel)
      strip.removeEventListener('pointerdown', pointerDown)
      strip.removeEventListener('pointermove', pointerMove)
      strip.removeEventListener('pointerup', pointerEnd)
      strip.removeEventListener('pointercancel', pointerEnd)
      strip.removeEventListener('click', clickAfterDrag, true)
      strip.removeEventListener('dragstart', stopNativeDrag)
      strip.classList.remove('is-dragging')
      observer.disconnect()
    }
  }, [results])
  const scrollCards = (direction) => cards.current?.scrollBy({ left: direction * Math.max(320, cards.current.clientWidth - 40), behavior: 'smooth' })
  const onCardsKeyDown = (event) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); scrollCards(event.key === 'ArrowRight' ? 1 : -1) }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); cards.current.scrollTo({ left: event.key === 'Home' ? 0 : cards.current.scrollWidth, behavior: 'smooth' }) }
  }
  return <EventsShell view="map"><div className="map-stage">
    <EventMap events={results} genres={genres} userLocation={user.location} selectedId={selectedId} focusId={focusedEvent?.id} hoverId={hoverId} onSelect={select} bottomInset={165} />
    <div className="map-stage__scroll-controls" role="group" aria-label="Scroll event cards">
      <button type="button" aria-label="Previous events" aria-controls="map-event-cards" disabled={!scrollable.back} onClick={() => scrollCards(-1)}>←</button>
      <button type="button" aria-label="Next events" aria-controls="map-event-cards" disabled={!scrollable.forward} onClick={() => scrollCards(1)}>→</button>
    </div>
    <div ref={cards} id="map-event-cards" className="map-stage__cards" role="region" tabIndex={0} aria-label="Events on the map" onKeyDown={onCardsKeyDown}>{results.map((event) => <div key={event.id} data-event-id={event.id} className="map-stage__card-wrap"><MapCard event={event} active={selectedId === event.id} onHover={setHoverId} /></div>)}</div>
  </div></EventsShell>
}

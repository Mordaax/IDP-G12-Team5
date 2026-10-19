import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { useSession } from '@/lib/useSession'
import { useToast } from '@/lib/toast'
import { addDays, dow, startOfDay } from '../utils/date'
import EventMap from './EventMap'
import { Avatar, ListCard, MapCard } from './EventParts'
import { useEvents } from './EventsContext'
import { DEFAULT_DAY, MAX_DISTANCE_KM, SORTS } from './eventModel'

function FilterSidebar({ onApplied }) {
  const filters = useEvents()
  const { requireLogin } = useSession()
  const toast = useToast()
  const [showArtists, setShowArtists] = useState(false)
  const [listening, setListening] = useState(false)
  const recognition = useRef(null)
  const searchInput = useRef(null)
  const { draft, genres, artists, events, preferences, preferencesOn, hasCustomChoices, dirty } = filters
  const genreCounts = useMemo(() => Object.fromEntries(genres.map((genre) => [genre.id, events.filter((event) => event.genreId === genre.id).length])), [genres, events])
  const days = Array.from({ length: 7 }, (_, index) => addDays(startOfDay(), index))
  const dayLabel = draft.day === 0 ? 'Today' : `Today – ${dow(days[draft.day])} ${days[draft.day].getDate()}`
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
  const savePreferences = () => requireLogin(() => {
    if (hasCustomChoices && !preferencesOn) { filters.savePreferences(); toast('Preferences saved') }
    else toast(preferencesOn ? 'These are already your saved preferences' : 'Choose some filters first, then save them')
  })

  return <aside className="events-filters" aria-label="Event filters">
    <div className="events-filters__search">
      <span aria-hidden="true">⌕</span>
      <input ref={searchInput} type="search" value={draft.q} placeholder="Search" aria-label="Search events, artists or venues" onChange={(event) => filters.setQuery(event.target.value)} />
      {draft.q && <button type="button" aria-label="Clear search" onClick={() => { filters.setQuery(''); searchInput.current?.focus() }}>×</button>}
      <button type="button" aria-label={listening ? 'Stop voice search' : 'Search by voice'} aria-pressed={listening} onClick={toggleVoice}>♩</button>
    </div>

    <div className="events-filters__prefs">
      <button type="button" aria-label="Save these filters as my preferences" onClick={savePreferences}>{preferencesOn ? '♥' : '♡'}</button>
      <span>Your Preferences</span>
      <input type="checkbox" role="switch" aria-label="Use my saved preferences" checked={preferencesOn} disabled={!preferences} onChange={(event) => filters.usePreferences(event.target.checked)} />
    </div>

    <section className="events-filters__group">
      <h2>Genre</h2>
      {genres.map((genre) => <label key={genre.id} className="events-filters__option"><input type="checkbox" checked={draft.genres.includes(genre.id)} onChange={() => filters.toggleDraft('genres', genre.id)} /><span>{genre.label}</span><small>{genreCounts[genre.id] || 0}</small></label>)}
    </section>

    <section className="events-filters__group">
      <h2>Artists</h2>
      {(showArtists ? artists : artists.slice(0, 2)).map((artist) => <label key={artist.id} className="events-filters__option"><input type="checkbox" checked={draft.artists.includes(artist.id)} onChange={() => filters.toggleDraft('artists', artist.id)} /><Avatar name={artist.name} hue={artist.hue} size={24} /><span>{artist.name}</span><small>{artist.eventCount}</small></label>)}
      {artists.length > 2 && <button type="button" className="events-filters__more" aria-expanded={showArtists} onClick={() => setShowArtists((value) => !value)}>{showArtists ? '− Show fewer artists' : '+ Show more artists'}</button>}
    </section>

    <section className="events-filters__group">
      <div className="events-filters__range-head"><h2>Distance</h2><strong>{draft.distance >= MAX_DISTANCE_KM ? '20+ km' : `Within ${draft.distance} km`}</strong></div>
      <input className="lrm-range" type="range" min="0" max={MAX_DISTANCE_KM} value={draft.distance} aria-label="Maximum distance in kilometres" aria-valuetext={draft.distance >= MAX_DISTANCE_KM ? '20 or more kilometres' : `${draft.distance} kilometres`} style={{ '--p': draft.distance / MAX_DISTANCE_KM }} onChange={(event) => filters.updateDraft({ distance: Number(event.target.value) })} />
      <div className="events-filters__ticks"><span>0</span><span>5</span><span>10</span><span>15</span><span>20+ km</span></div>
    </section>

    <section className="events-filters__group">
      <div className="events-filters__range-head"><h2>Date</h2><strong>{dayLabel}</strong></div>
      <input className="lrm-range" type="range" min="0" max={DEFAULT_DAY} value={draft.day} aria-label="Show events up to" aria-valuetext={dayLabel} style={{ '--p': draft.day / DEFAULT_DAY }} onChange={(event) => filters.updateDraft({ day: Number(event.target.value) })} />
      <div className="events-filters__ticks">{days.map((day, index) => <span key={index}>{index ? dow(day) : 'Today'}<small>{day.getDate()}</small></span>)}</div>
    </section>

    <div className="events-filters__footer"><button type="button" onClick={() => { filters.apply(); onApplied() }}>{dirty ? 'Apply changes' : 'Apply filters'}</button><button type="button" onClick={filters.reset}>Reset filters</button></div>
  </aside>
}

function EventsShell({ view, children }) {
  const filters = useEvents()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const count = filters.results.length
  const noun = `${count} event${count === 1 ? '' : 's'}`
  const subtitle = filters.artistSummary ? `${noun} featuring ${filters.artistSummary}` : filters.venueName ? `${noun} at ${filters.venueName}` : filters.applied.q.trim() ? `${noun} matching “${filters.applied.q.trim()}”` : `${noun} coming up near you`
  return <Page active="events" className="react-events">
    <main className={`events-shell ${view === 'map' ? 'is-map' : ''} ${filtersOpen ? 'filters-open' : ''}`}>
      <header className="events-shell__head"><div><h1>Events</h1><p aria-live="polite">{subtitle}</p></div><div className="events-shell__actions"><div className="view-toggle" role="group" aria-label="Events view"><Link to="/events/map" className={view === 'map' ? 'is-active' : ''} aria-current={view === 'map' ? 'page' : undefined}>Map</Link><Link to="/events/list" className={view === 'list' ? 'is-active' : ''} aria-current={view === 'list' ? 'page' : undefined}>List</Link></div><label className="events-sort">Sort by <select aria-label="Sort events" value={filters.sort} onChange={(event) => filters.setSort(event.target.value)}>{SORTS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}</select></label></div></header>
      <button className="events-shell__filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="events-filters" onClick={() => setFiltersOpen((open) => !open)}>☷ Filters {filters.activeCount > 0 && <span>{filters.activeCount}</span>}</button>
      <div className="events-shell__body">
        <div id="events-filters" className={`events-shell__sidebar ${filtersOpen ? 'is-open' : ''}`}><FilterSidebar onApplied={() => setFiltersOpen(false)} /></div>
        <section className="events-shell__main">
          {filters.applied.venue && <button type="button" className="events-shell__chip" onClick={filters.clearVenue}>At {filters.venueName} ×</button>}
          {filters.loading ? <div className="events-shell__state" role="status">Loading events…</div>
            : filters.error ? <div className="events-shell__state"><p>{filters.error}</p><button type="button" onClick={filters.load}>Try again</button></div>
            : !count ? <div className="events-shell__state"><h2>No events match these filters</h2><p>Try a wider distance, a later date, or fewer genres.</p><button type="button" onClick={filters.reset}>Reset filters</button></div>
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
  const { results, genres, user, sort } = useEvents()
  const [selectedId, setSelectedId] = useState(null)
  const [hoverId, setHoverId] = useState(null)
  const cards = useRef(null)
  const select = useCallback((id) => {
    setSelectedId((current) => current === id ? null : id)
    cards.current?.querySelector(`[data-event-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [])
  useEffect(() => { cards.current?.scrollTo({ left: 0, behavior: 'smooth' }) }, [sort])
  return <EventsShell view="map"><div className="map-stage"><EventMap events={results} genres={genres} userLocation={user.location} selectedId={selectedId} hoverId={hoverId} onSelect={select} /><div ref={cards} className="map-stage__cards" aria-label="Events on the map">{results.map((event) => <div key={event.id} data-event-id={event.id} className="map-stage__card-wrap"><MapCard event={event} active={selectedId === event.id} onHover={setHoverId} /></div>)}</div></div></EventsShell>
}

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { createDemoEventLocation } from './eventLocation'
import { useLocation } from 'react-router-dom'
import { USER } from '@/data'
import { sessionGet, sessionSet } from '@/lib/session'
import { fetchEventCatalog } from '../services/eventsService'
import { blankFilters, cloneFilters, dateRangeError, filterEvents, filtersEqual, includeFocusedEvent, readEventQuery, restorePreferences, snapshotPreferences } from './eventModel'

const EventsContext = createContext(null)
const PREFERENCES_KEY = 'lrm.preferences'
const SAVED_KEY = 'lrm.savedEvents'

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function readPreferences() {
  const restored = restorePreferences(readStorage(PREFERENCES_KEY, null))
  return restored ? snapshotPreferences(restored.filters, restored.sort) : null
}
function readSaved() {
  const value = sessionGet(SAVED_KEY, [])
  return new Set(Array.isArray(value) ? value : [])
}

let catalogPromise
export function EventsProvider({ children }) {
  const location = useLocation()
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(blankFilters)
  const [applied, setApplied] = useState(blankFilters)
  const [sort, setSort] = useState('soonest')
  const [preferences, setPreferences] = useState(readPreferences)
  const [saveBaseline, setSaveBaseline] = useState(() => snapshotPreferences(blankFilters(), 'soonest'))
  const [saved, setSaved] = useState(readSaved)
  const [locationAccess] = useState(() => createDemoEventLocation(USER.location))
  const locationState = useSyncExternalStore(locationAccess.subscribe, locationAccess.getSnapshot, locationAccess.getSnapshot)

  const load = () => {
    if (!catalogPromise) catalogPromise = fetchEventCatalog(USER.location).catch((failure) => {
      catalogPromise = null
      throw failure
    })
    catalogPromise.then(setCatalog).catch((failure) => setError(failure?.message || 'Could not load events.'))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const { artist, venue, q } = readEventQuery(location.search)
    if (!artist && !venue && !q) return
    const next = { ...blankFilters(), q, artists: artist ? [artist] : [], venue: venue || null }
    setDraft(next)
    setApplied(cloneFilters(next))
    setSaveBaseline(snapshotPreferences(next, sort))
  }, [location.search])

  const updateDraft = (patch) => setDraft((old) => ({ ...old, ...patch }))
  const setQuery = (q) => updateDraft({ q })
  useEffect(() => {
    const timer = setTimeout(() => setApplied((old) => ({ ...old, q: draft.q })), 200)
    return () => clearTimeout(timer)
  }, [draft.q])
  const dateError = dateRangeError(draft)
  const apply = () => { if (!dateError) setApplied(cloneFilters(draft)) }
  const reset = () => { setDraft(blankFilters()); setApplied(blankFilters()) }
  const toggleDraft = (field, id) => setDraft((old) => ({ ...old, [field]: old[field].includes(id) ? old[field].filter((item) => item !== id) : [...old[field], id] }))
  const clearVenue = () => { updateDraft({ venue: null }); setApplied((old) => ({ ...old, venue: null })) }
  const savePreferences = () => {
    if (dateError) return
    const next = snapshotPreferences(draft, sort)
    setPreferences(next)
    setSaveBaseline(next)
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)) } catch { /* in-memory state still works */ }
  }
  const loadPreferences = () => {
    const restored = restorePreferences(preferences)
    if (!restored) return
    setDraft(restored.filters)
    setSort(restored.sort)
    setSaveBaseline(snapshotPreferences(restored.filters, restored.sort))
  }
  const toggleSaved = (id) => {
    const next = new Set(saved)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSaved(next)
    sessionSet(SAVED_KEY, [...next])
    return next.has(id)
  }

  const events = catalog?.events || []
  const artists = catalog?.artists || []
  const genres = catalog?.genres || []
  const venues = catalog?.venues || []
  const focusedEventId = location.pathname === '/events/map' ? readEventQuery(location.search).event : ''
  const results = useMemo(() => includeFocusedEvent(filterEvents(events, applied, sort), events, focusedEventId), [events, applied, sort, focusedEventId])
  const artistSummary = applied.artists.map((id) => artists.find((artist) => artist.id === id)?.name).filter(Boolean).join(', ')
  const venueName = venues.find((venue) => venue.id === applied.venue)?.name || ''
  const activeCount = Number(!!applied.genres.length) + Number(!!applied.artists.length) + Number(!!applied.startDate || !!applied.endDate) + Number(!!applied.q.trim()) + Number(!!applied.venue)
  const dirty = !filtersEqual(draft, applied)
  const canSavePreferences = !dateError && (!filtersEqual(draft, saveBaseline) || sort !== saveBaseline.sort)

  const value = {
    events, artists, genres, venues, results, draft, applied, sort, setSort,
    loading: !catalog && !error, error, load, updateDraft, setQuery, apply, reset,
    toggleDraft, clearVenue, savePreferences, loadPreferences, preferences,
    dirty, dateError, canSavePreferences, saved, toggleSaved,
    artistSummary, venueName, activeCount, user: USER, locationAccess, locationState,
  }
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used inside EventsProvider')
  return context
}

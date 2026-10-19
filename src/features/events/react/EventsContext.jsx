import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { USER } from '@/data'
import { fetchEventCatalog } from '../services/eventsService'
import { blankFilters, cloneFilters, DEFAULT_DISTANCE_KM, DEFAULT_DAY, filterEvents, MAX_DISTANCE_KM, readEventQuery } from './eventModel'

const EventsContext = createContext(null)
const PREFERENCES_KEY = 'lrm.preferences'
const SAVED_KEY = 'lrm.savedEvents'

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function readPreferences() {
  const value = readStorage(PREFERENCES_KEY, null)
  return value && Array.isArray(value.genres) && Array.isArray(value.artists) && Number.isFinite(value.distance) && Number.isFinite(value.day) ? value : null
}
function readSaved() {
  const value = readStorage(SAVED_KEY, [])
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
  const [saved, setSaved] = useState(readSaved)

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
    const next = { ...blankFilters(), q, artists: artist ? [artist] : [], venue: venue || null, distance: venue ? MAX_DISTANCE_KM : DEFAULT_DISTANCE_KM }
    setDraft(next)
    setApplied(cloneFilters(next))
  }, [location.search])

  const updateDraft = (patch) => setDraft((old) => ({ ...old, ...patch }))
  const setQuery = (q) => updateDraft({ q })
  useEffect(() => {
    const timer = setTimeout(() => setApplied((old) => ({ ...old, q: draft.q })), 200)
    return () => clearTimeout(timer)
  }, [draft.q])
  const apply = () => setApplied(cloneFilters(draft))
  const reset = () => { setDraft(blankFilters()); setApplied(blankFilters()) }
  const toggleDraft = (field, id) => setDraft((old) => ({ ...old, [field]: old[field].includes(id) ? old[field].filter((item) => item !== id) : [...old[field], id] }))
  const clearVenue = () => { updateDraft({ venue: null }); setApplied((old) => ({ ...old, venue: null })) }
  const savePreferences = () => {
    const next = { genres: [...draft.genres], artists: [...draft.artists], distance: draft.distance, day: draft.day }
    setPreferences(next)
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)) } catch { /* in-memory state still works */ }
  }
  const usePreferences = (on) => {
    const next = on && preferences
      ? { ...draft, genres: [...preferences.genres], artists: [...preferences.artists], distance: preferences.distance, day: preferences.day }
      : { ...blankFilters(), q: draft.q, venue: draft.venue }
    setDraft(next)
    setApplied(cloneFilters(next))
  }
  const toggleSaved = (id) => {
    const next = new Set(saved)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSaved(next)
    try { localStorage.setItem(SAVED_KEY, JSON.stringify([...next])) } catch { /* in-memory state still works */ }
    return next.has(id)
  }

  const events = catalog?.events || []
  const artists = catalog?.artists || []
  const genres = catalog?.genres || []
  const venues = catalog?.venues || []
  const results = useMemo(() => filterEvents(events, applied, sort), [events, applied, sort])
  const artistSummary = applied.artists.map((id) => artists.find((artist) => artist.id === id)?.name).filter(Boolean).join(', ')
  const venueName = venues.find((venue) => venue.id === applied.venue)?.name || ''
  const activeCount = Number(!!applied.genres.length) + Number(!!applied.artists.length) + Number(applied.distance < MAX_DISTANCE_KM && applied.distance !== DEFAULT_DISTANCE_KM) + Number(applied.day !== DEFAULT_DAY) + Number(!!applied.q.trim()) + Number(!!applied.venue)
  const preferencesOn = !!preferences && ['genres', 'artists'].every((field) => draft[field].length === preferences[field].length && draft[field].every((id) => preferences[field].includes(id))) && draft.distance === preferences.distance && draft.day === preferences.day
  const hasCustomChoices = !!draft.genres.length || !!draft.artists.length || draft.distance !== DEFAULT_DISTANCE_KM || draft.day !== DEFAULT_DAY
  const dirty = ['genres', 'artists'].some((field) => draft[field].length !== applied[field].length || draft[field].some((id) => !applied[field].includes(id))) || draft.distance !== applied.distance || draft.day !== applied.day

  const value = {
    events, artists, genres, venues, results, draft, applied, sort, setSort,
    loading: !catalog && !error, error, load, updateDraft, setQuery, apply, reset,
    toggleDraft, clearVenue, savePreferences, usePreferences, preferences,
    preferencesOn, hasCustomChoices, dirty, saved, toggleSaved,
    artistSummary, venueName, activeCount, user: USER,
  }
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used inside EventsProvider')
  return context
}

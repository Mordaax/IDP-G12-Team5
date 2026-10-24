import { addDays, calendarDate, isCalendarDate, startOfDay } from '../utils/date.js'

const LEGACY_MAX_DAY = 6

export const SORTS = [
  { value: 'soonest', label: 'Earliest' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price', label: 'Price: low to high' },
]

export const blankFilters = () => ({
  q: '', genres: [], artists: [], venue: null,
  startDate: '', endDate: '',
})

export const cloneFilters = (filters) => ({
  q: filters.q, venue: filters.venue, startDate: filters.startDate, endDate: filters.endDate,
  genres: [...filters.genres],
  artists: [...filters.artists],
})

export function searchArtists(artists, query, selected = []) {
  const term = query.trim().toLowerCase()
  if (!term) return []
  const excluded = new Set(selected)
  const matches = []
  for (const artist of artists) {
    if (!excluded.has(artist.id) && artist.name.toLowerCase().includes(term)) matches.push(artist)
    if (matches.length === 5) break
  }
  return matches
}

export const filtersEqual = (a, b) =>
  ['genres', 'artists'].every((field) => a[field].length === b[field].length && a[field].every((id) => b[field].includes(id))) &&
  ['q', 'venue', 'startDate', 'endDate'].every((field) => a[field] === b[field])

export const snapshotPreferences = (filters, sort) => ({ ...cloneFilters(filters), sort })

export function dateRangeError({ startDate = '', endDate = '' }) {
  if (startDate && !isCalendarDate(startDate)) return 'Choose a valid start date.'
  if (endDate && !isCalendarDate(endDate)) return 'Choose a valid end date.'
  if (startDate && endDate && startDate > endDate) return 'End date must be on or after start date.'
  return ''
}

export function restorePreferences(value) {
  if (!value || !['genres', 'artists'].every((field) => Array.isArray(value[field]) && value[field].every((id) => typeof id === 'string'))) return null
  let range
  if (Object.hasOwn(value, 'startDate') || Object.hasOwn(value, 'endDate')) {
    if (typeof value.startDate !== 'string' || typeof value.endDate !== 'string' || dateRangeError(value)) return null
    range = { startDate: value.startDate, endDate: value.endDate }
  } else {
    // Migrate saved week-slider preferences without dropping their date restriction.
    if (!Number.isInteger(value.day) || value.day < 0 || value.day > LEGACY_MAX_DAY) return null
    const today = startOfDay()
    range = { startDate: calendarDate(today), endDate: calendarDate(addDays(today, value.day)) }
  }
  return {
    filters: { q: typeof value.q === 'string' ? value.q : '', genres: [...value.genres], artists: [...value.artists], venue: typeof value.venue === 'string' ? value.venue : null, ...range },
    sort: SORTS.some((sort) => sort.value === value.sort) ? value.sort : 'soonest',
  }
}

export function readEventQuery(search) {
  const params = new URLSearchParams(search)
  return {
    artist: params.get('artist') || '',
    venue: params.get('venue') || '',
    q: params.get('q') || '',
    event: params.get('event') || '',
  }
}

export const eventMapUrl = (id) => `/events/map?event=${encodeURIComponent(id)}`

// Public naming is independent of persisted event, save and discussion identities.
export const eventUrl = (id) => `/events/${id === 'fallingislands-battlebox' ? 'djbeatroot-battlebox' : id}`
export const eventIdFromSlug = (slug) => slug === 'djbeatroot-battlebox' ? 'fallingislands-battlebox' : slug

export function includeFocusedEvent(results, events, focusId) {
  const focused = events.find((event) => event.id === focusId)
  return focused && !results.some((event) => event.id === focusId) ? [...results, focused] : results
}

const sorters = {
  soonest: (a, b) => a.startsAt - b.startsAt,
  nearest: (a, b) => a.distanceKm - b.distanceKm || a.startsAt - b.startsAt,
  popular: (a, b) => b.going - a.going || a.startsAt - b.startsAt,
  price: (a, b) => a.price - b.price || a.startsAt - b.startsAt,
}

export function filterEvents(events, filters, sort = 'soonest') {
  const query = filters.q.trim().toLowerCase()
  if (dateRangeError(filters)) return []
  const hasCalendarRange = Object.hasOwn(filters, 'startDate') || Object.hasOwn(filters, 'endDate')
  const withinDates = (event) => {
    // Compatibility for old callers; the live UI and migrated preferences use calendar dates.
    if (!hasCalendarRange) return !!filters.venue || event.dayOffset <= (filters.day ?? Infinity)
    const date = calendarDate(event.startsAt)
    return (!filters.startDate || date >= filters.startDate) && (!filters.endDate || date <= filters.endDate)
  }
  return events.filter((event) =>
    event.dayOffset >= 0 &&
    (!filters.venue || event.venueId === filters.venue) && withinDates(event) &&
    (!filters.genres.length || filters.genres.includes(event.genreId)) &&
    (!filters.artists.length || event.artistIds.some((id) => filters.artists.includes(id))) &&
    (!query || event.searchText.includes(query)),
  ).sort(sorters[sort] || sorters.soonest)
}

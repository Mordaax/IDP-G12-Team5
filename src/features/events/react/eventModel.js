export const MAX_DISTANCE_KM = 20
export const DEFAULT_DISTANCE_KM = 13
export const DEFAULT_DAY = 6

export const SORTS = [
  { value: 'soonest', label: 'Earliest' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price', label: 'Price: low to high' },
]

export const blankFilters = () => ({
  q: '', genres: [], artists: [], venue: null,
  distance: DEFAULT_DISTANCE_KM, day: DEFAULT_DAY,
})

export const cloneFilters = (filters) => ({
  ...filters,
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
  ['q', 'venue', 'distance', 'day'].every((field) => a[field] === b[field])

export const snapshotPreferences = (filters, sort) => ({ ...cloneFilters(filters), sort })

export function restorePreferences(value) {
  if (!value || !['genres', 'artists'].every((field) => Array.isArray(value[field]) && value[field].every((id) => typeof id === 'string')) ||
    !Number.isFinite(value.distance) || value.distance < 0 || value.distance > MAX_DISTANCE_KM ||
    !Number.isInteger(value.day) || value.day < 0 || value.day > DEFAULT_DAY) return null
  return {
    filters: { q: typeof value.q === 'string' ? value.q : '', genres: [...value.genres], artists: [...value.artists], venue: typeof value.venue === 'string' ? value.venue : null, distance: value.distance, day: value.day },
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
  return events.filter((event) =>
    event.dayOffset >= 0 &&
    (filters.venue ? event.venueId === filters.venue : event.dayOffset <= filters.day) &&
    (!filters.genres.length || filters.genres.includes(event.genreId)) &&
    (!filters.artists.length || event.artistIds.some((id) => filters.artists.includes(id))) &&
    (filters.distance >= MAX_DISTANCE_KM || event.distanceKm <= filters.distance) &&
    (!query || event.searchText.includes(query)),
  ).sort(sorters[sort] || sorters.soonest)
}

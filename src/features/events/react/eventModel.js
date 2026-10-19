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

export function readEventQuery(search) {
  const params = new URLSearchParams(search)
  return {
    artist: params.get('artist') || '',
    venue: params.get('venue') || '',
    q: params.get('q') || '',
  }
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

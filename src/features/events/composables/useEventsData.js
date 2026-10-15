import { ref } from 'vue'
import { fetchEventCatalog } from '../services/eventsService'
import { useCurrentUser } from '@/composables/useCurrentUser'

// Module-level state: the catalog is fetched once and shared by the map view,
// list view and detail view, so switching between them is instant.
const events = ref([])
const artists = ref([])
const genres = ref([])
const venues = ref([])
const loading = ref(false)
const error = ref('')

let inflight = null

function load() {
  if (inflight) return inflight
  const { user } = useCurrentUser()
  loading.value = true
  error.value = ''
  inflight = fetchEventCatalog(user.value.location)
    .then((catalog) => {
      events.value = catalog.events
      artists.value = catalog.artists
      genres.value = catalog.genres
      venues.value = catalog.venues
    })
    .catch((e) => {
      inflight = null // allow a retry
      error.value = e?.message || 'Could not load events.'
    })
    .finally(() => {
      loading.value = false
    })
  return inflight
}

export function useEventsData() {
  const { user } = useCurrentUser()
  return {
    events,
    artists,
    genres,
    venues,
    loading,
    error,
    user,
    load,
    getEvent: (id) => events.value.find((e) => e.id === id) || null,
  }
}

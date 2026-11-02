// Demonstration adapter: simulate consent using the shared persona, never the device.
export function createDemoEventLocation(location) {
  return createEventLocation({
    getCurrentPosition(onSuccess) {
      onSuccess({ coords: { latitude: location.lat, longitude: location.lng } })
    },
  })
}

// Provider-owned state lasts across Events navigation, but never persists coordinates.
export function createEventLocation(geolocation) {
  let snapshot = { status: 'unasked', location: null }
  const listeners = new Set()
  const update = (status, location = null) => {
    snapshot = { status, location }
    listeners.forEach(listener => listener())
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    skip() { if (snapshot.status === 'unasked') update('skipped') },
    request() {
      if (snapshot.status === 'requesting') return
      if (!geolocation) { update('unavailable'); return }
      update('requesting')
      geolocation.getCurrentPosition(
        ({ coords }) => update('granted', { lat: coords.latitude, lng: coords.longitude }),
        error => update(error.code === 1 ? 'denied' : 'unavailable'),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      )
    },
  }
}

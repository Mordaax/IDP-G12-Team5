// Geo helpers shared by the services and the (placeholder) map.

const EARTH_RADIUS_KM = 6371

/** Great-circle distance between two {lat,lng} points, in km. */
export function distanceKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function formatDistance(km) {
  return km < 10 ? `${km.toFixed(1)}km` : `${Math.round(km)}km`
}

/** Deep links that work without any API key (open in Google Maps). */
export function mapsSearchUrl({ lat, lng }) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
export function mapsDirectionsUrl({ lat, lng }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`
}

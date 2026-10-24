import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from '@/components/AppLink'
import { ATTRIBUTION, MAX_ZOOM, MIN_ZOOM, SG_BOUNDS, TILE_URL } from '../utils/onemap'
import { eventMapUrl } from './eventModel'

export default function EventVenueMap({ event }) {
  const element = useRef(null)
  const { lat, lng, name } = event.venue
  const color = event.genre.hex

  useEffect(() => {
    const map = L.map(element.current, {
      zoomControl: true, scrollWheelZoom: false,
      minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, maxBounds: SG_BOUNDS,
    }).setView([lat, lng], 15)
    map.attributionControl.setPrefix(false)
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM }).addTo(map)
    L.circleMarker([lat, lng], { radius: 9, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1, interactive: false }).addTo(map)
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(element.current)
    return () => { observer.disconnect(); map.remove() }
  }, [lat, lng, color])

  return <aside className="event-venue-map" aria-label="Event location">
    <div ref={element} className="event-venue-map__canvas" role="region" aria-label={`Interactive map showing ${name}`} />
    <Link to={eventMapUrl(event.id)} className="event-venue-map__link"><strong>{name}</strong><span>View on map →</span></Link>
  </aside>
}

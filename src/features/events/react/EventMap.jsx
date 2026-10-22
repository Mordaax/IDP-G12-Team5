import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ATTRIBUTION, MAX_ZOOM, MIN_ZOOM, SG_BOUNDS, TILE_URL, nearestPlace } from '../utils/onemap'

const escape = (value) => String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character])

export default function EventMap({ events, genres, userLocation, selectedId, hoverId, onSelect, bottomInset = 127 }) {
  const element = useRef(null)
  const wheelHost = useRef(null)
  const map = useRef(null)
  const pinLayer = useRef(null)
  const markers = useRef(new Map())
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [zoom, setZoom] = useState(15)
  const [keyOpen, setKeyOpen] = useState(() => window.innerWidth >= 768)
  const [near, setNear] = useState(null)
  const [pinHover, setPinHover] = useState(null)
  const [zoomHint, setZoomHint] = useState(false)
  const hintTimer = useRef(null)

  useEffect(() => {
    const onWheel = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        const step = Math.max(-1, Math.min(1, -event.deltaY / 60)) * 0.5
        map.current?.setZoomAround(map.current.mouseEventToContainerPoint(event), map.current.getZoom() + step, { animate: false })
      } else {
        setZoomHint(true)
        clearTimeout(hintTimer.current)
        hintTimer.current = setTimeout(() => setZoomHint(false), 1200)
      }
    }
    const host = wheelHost.current
    host.addEventListener('wheel', onWheel, { passive: false })
    return () => host.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const instance = L.map(element.current, {
      zoomControl: false, scrollWheelZoom: false, doubleClickZoom: true,
      zoomSnap: 0.25, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM,
      maxBounds: SG_BOUNDS, maxBoundsViscosity: 1,
    })
    instance.attributionControl.setPrefix(false)
    L.tileLayer(TILE_URL, { detectRetina: true, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, attribution: ATTRIBUTION }).addTo(instance)
    instance.on('zoomend', () => setZoom(instance.getZoom()))
    L.marker([userLocation.lat, userLocation.lng], {
      icon: L.divIcon({ className: 'event-you-pin', iconSize: [0, 0], html: '<span class="event-you-pin__area"></span><span class="event-you-pin__dot"></span>' }),
      keyboard: false, interactive: false, zIndexOffset: -100,
    }).addTo(instance)
    map.current = instance
    pinLayer.current = L.layerGroup().addTo(instance)
    const observer = new ResizeObserver(() => instance.invalidateSize())
    observer.observe(element.current)
    setReady(true)
    nearestPlace(userLocation).then(setNear)
    return () => {
      observer.disconnect()
      clearTimeout(hintTimer.current)
      instance.remove()
      map.current = null
      pinLayer.current = null
      markers.current.clear()
      setReady(false)
    }
  }, [userLocation])

  useEffect(() => {
    if (!ready || !map.current) return
    pinLayer.current.clearLayers()
    markers.current.clear()
    const colors = new Map(genres.map((genre) => [genre.id, genre.hex]))
    // Several events at one venue would stack their pins on the very same spot (and a click would pick whichever is on top),
    // so side-by-side pins are spread a little: each event gets its own pin to hover and click.
    const byVenue = new Map()
    for (const event of events) byVenue.set(event.venueId, [...(byVenue.get(event.venueId) || []), event.id])
    for (const event of events) {
      const group = byVenue.get(event.venueId)
      const dx = (group.indexOf(event.id) - (group.length - 1) / 2) * 26
      const label = `${event.headliner.name} · ${event.dowLabel} ${event.timeCompact}`
      const color = colors.get(event.genreId) || 'var(--lrm-accent)'
      const icon = L.divIcon({
        className: 'event-pin', iconSize: [0, 0],
        html: `<button type="button" class="event-pin__dot" style="--pin:${escape(color)};--dx:${dx}px" aria-label="${escape(label)}"></button><span class="event-pin__label" style="--dx:${dx}px">${escape(label)}</span>`,
      })
      const marker = L.marker([event.venue.lat, event.venue.lng], { icon, keyboard: false, riseOnHover: true })
        .on('click', () => onSelect(event.id))
        .on('dblclick', (mouseEvent) => { L.DomEvent.stop(mouseEvent); navigate(`/events/${event.id}`) })
        .on('mouseover', () => setPinHover(event.id))
        .on('mouseout', () => setPinHover(null))
        .addTo(pinLayer.current)
      markers.current.set(event.id, marker)
    }
    const points = [...events.map((event) => [event.venue.lat, event.venue.lng]), [userLocation.lat, userLocation.lng]]
    map.current.fitBounds(L.latLngBounds(points), {
      paddingTopLeft: [keyOpen ? 230 : 40, 50], paddingBottomRight: [70, bottomInset + 40], maxZoom: 15, animate: false,
    })
  }, [ready, events, genres, userLocation, keyOpen, bottomInset, navigate, onSelect])

  useEffect(() => {
    const active = hoverId || pinHover || selectedId
    for (const [id, marker] of markers.current) {
      const element = marker.getElement()
      element?.classList.toggle('is-active', id === active)
      element?.classList.toggle('is-labelled', events.length <= 5 || id === active)
      marker.setZIndexOffset(id === active ? 1000 : 0)
    }
  }, [hoverId, pinHover, selectedId, events])

  useEffect(() => {
    const marker = selectedId && markers.current.get(selectedId)
    if (!marker || !map.current) return
    const point = map.current.latLngToContainerPoint(marker.getLatLng())
    const size = map.current.getSize()
    if (point.x < 80 || point.x > size.x - 80 || point.y < 80 || point.y > size.y - bottomInset - 80) map.current.panTo(marker.getLatLng())
  }, [selectedId, bottomInset])

  const fitAll = () => {
    if (!map.current) return
    const points = [...events.map((event) => [event.venue.lat, event.venue.lng]), [userLocation.lat, userLocation.lng]]
    map.current.fitBounds(L.latLngBounds(points), { paddingTopLeft: [keyOpen ? 230 : 40, 50], paddingBottomRight: [70, bottomInset + 40], maxZoom: 15 })
  }
  return <div ref={wheelHost} className="event-map">
    <div ref={element} className="event-map__leaflet" />
    {zoomHint && <div className="event-map__hint">Use Ctrl + scroll to zoom the map</div>}
    <div className="event-map__key" onPointerDown={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
      <button type="button" aria-expanded={keyOpen} onClick={() => setKeyOpen((open) => !open)}>Genre key <span>{keyOpen ? '⌃' : '⌄'}</span></button>
      {keyOpen && <ul>{genres.map((genre) => <li key={genre.id}><i style={{ background: genre.hex }} />{genre.label}</li>)}<li><i className="event-map__you-key" />Your location{near && <small>near {near}</small>}</li></ul>}
    </div>
    <div className="event-map__zoom" onPointerDown={(event) => event.stopPropagation()}>
      <button type="button" aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => map.current?.zoomIn()}>+</button>
      <button type="button" aria-label="Zoom out" disabled={zoom <= MIN_ZOOM} onClick={() => map.current?.zoomOut()}>−</button>
      <button type="button" aria-label="Show all events" onClick={fitAll}>⤢</button>
    </div>
  </div>
}

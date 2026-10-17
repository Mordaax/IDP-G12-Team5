<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ATTRIBUTION, MAX_ZOOM, MIN_ZOOM, SG_BOUNDS, TILE_URL, nearestPlace } from '../utils/onemap'

// Interactive map of the events (OneMap tiles, drawn with Leaflet), with the genre key and
// zoom buttons on top. Laid out like Figma "📸 13 Events (Map) Filtered".
//
//   props:  events (hydrated, with event.venue.lat/lng), genres, userLocation,
//           selectedId, hoverId
//   emits:  select(id), open(id)
const props = defineProps({
  events: { type: Array, required: true },
  genres: { type: Array, required: true },
  userLocation: { type: Object, required: true },
  selectedId: { type: String, default: null },
  hoverId: { type: String, default: null },
  // room kept free at the bottom for the event cards that sit over the map
  bottomInset: { type: Number, default: 0 },
})
const emit = defineEmits(['select', 'open'])

const el = ref(null)
const zoom = ref(15)
const keyOpen = ref(typeof window === 'undefined' || window.innerWidth >= 768)
const near = ref(null) // "Waterloo Street": the nearest place to you, from OneMap
let map = null
let pinLayer = null
const markers = new Map() // event id -> Leaflet marker

const genreById = computed(() => new Map(props.genres.map((g) => [g.id, g])))
const pins = computed(() =>
  props.events.map((e) => ({
    id: e.id,
    latLng: [e.venue.lat, e.venue.lng],
    color: genreById.value.get(e.genreId)?.color || 'var(--lrm-blue)',
    label: `${e.headliner.name} · ${e.dowLabel} ${e.timeCompact}`,
  })),
)
// with only a few events (e.g. one artist) every pin is labelled, as in Figma
const labelAll = computed(() => pins.value.length <= 5)
const pinHoverId = ref(null)
const activeId = computed(() => props.hoverId || pinHoverId.value || props.selectedId)

const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function drawPins() {
  pinLayer.clearLayers()
  markers.clear()
  for (const pin of pins.value) {
    const icon = L.divIcon({
      className: 'event-pin',
      iconSize: [0, 0],
      html: `<button type="button" class="event-pin__dot" style="--pin:${pin.color}" aria-label="${escape(pin.label)}"></button><span class="event-pin__label">${escape(pin.label)}</span>`,
    })
    const marker = L.marker(pin.latLng, { icon, keyboard: false, riseOnHover: true })
      .on('click', () => emit('select', pin.id))
      .on('dblclick', (e) => {
        L.DomEvent.stop(e)
        emit('open', pin.id)
      })
      .on('mouseover', () => (pinHoverId.value = pin.id))
      .on('mouseout', () => (pinHoverId.value = null))
      .addTo(pinLayer)
    markers.set(pin.id, marker)
  }
  markActive()
}

function markActive() {
  for (const [id, marker] of markers) {
    const node = marker.getElement()
    if (!node) continue
    node.classList.toggle('is-active', id === activeId.value)
    node.classList.toggle('is-labelled', labelAll.value || id === activeId.value)
    marker.setZIndexOffset(id === activeId.value ? 1000 : 0)
  }
}

// leave room for the genre key (left) and the event cards (bottom)
const padding = () => ({ paddingTopLeft: [keyOpen.value ? 230 : 40, 50], paddingBottomRight: [70, props.bottomInset + 40] })

function fitAll(animate = true) {
  const points = [...pins.value.map((p) => p.latLng), [props.userLocation.lat, props.userLocation.lng]]
  map.fitBounds(L.latLngBounds(points), { ...padding(), maxZoom: 15, animate })
}

const zoomIn = () => map.zoomIn()
const zoomOut = () => map.zoomOut()

// Plain scrolling scrolls the page; Ctrl (or Cmd) + scroll zooms the map.
const zoomHint = ref(false)
let hintTimer = null
function onWheel(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const step = Math.max(-1, Math.min(1, -e.deltaY / 60)) * 0.5
    map.setZoomAround(map.mouseEventToContainerPoint(e), map.getZoom() + step, { animate: false })
    return
  }
  zoomHint.value = true
  clearTimeout(hintTimer)
  hintTimer = setTimeout(() => (zoomHint.value = false), 1200)
}

let resizeObserver
onMounted(async () => {
  map = L.map(el.value, {
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: true,
    zoomSnap: 0.25,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    maxBounds: SG_BOUNDS,
    maxBoundsViscosity: 1,
  })
  map.attributionControl.setPrefix(false)
  L.tileLayer(TILE_URL, { detectRetina: true, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, attribution: ATTRIBUTION }).addTo(map)
  map.on('zoomend', () => (zoom.value = map.getZoom()))

  // you are here: a soft circle with a dot (no pulsing)
  L.marker([props.userLocation.lat, props.userLocation.lng], {
    icon: L.divIcon({ className: 'you-pin', iconSize: [0, 0], html: '<span class="you-pin__area"></span><span class="you-pin__dot"></span>' }),
    keyboard: false,
    interactive: false,
    zIndexOffset: -100,
  }).addTo(map)

  pinLayer = L.layerGroup().addTo(map)
  drawPins()
  fitAll(false)

  resizeObserver = new ResizeObserver(() => map.invalidateSize())
  resizeObserver.observe(el.value)

  near.value = await nearestPlace(props.userLocation)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  map?.remove()
})

watch(pins, () => {
  if (!map) return
  drawPins()
  fitAll()
})
watch([activeId, labelAll], markActive)

// Bring the selected pin into view when it is chosen from a pin or a card.
watch(
  () => props.selectedId,
  (id) => {
    const marker = id && markers.get(id)
    if (!marker) return
    const p = map.latLngToContainerPoint(marker.getLatLng())
    const size = map.getSize()
    const margin = 80
    const visible = p.x > margin && p.x < size.x - margin && p.y > margin && p.y < size.y - props.bottomInset - margin
    if (!visible) map.panTo(marker.getLatLng())
  },
)
</script>

<template>
  <div class="event-map" @wheel.capture="onWheel">
    <div ref="el" class="event-map__leaflet"></div>

    <!-- shown briefly when scrolling over the map -->
    <Transition name="zoom-hint">
      <div v-if="zoomHint" class="event-map__hint">Use Ctrl + scroll to zoom the map</div>
    </Transition>

    <!-- genre key -->
    <div class="event-map__key" @pointerdown.stop @dblclick.stop>
      <button type="button" class="event-map__key-head" :aria-expanded="keyOpen" @click="keyOpen = !keyOpen">
        Genre key <i class="bi" :class="keyOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
      </button>
      <ul v-show="keyOpen" class="event-map__key-list">
        <li v-for="g in genres" :key="g.id"><span class="dot" :style="{ background: g.color }"></span>{{ g.label }}</li>
        <li class="event-map__key-you">
          <span class="dot dot--you"></span>
          <span>Your location<small v-if="near" class="event-map__near">near {{ near }}</small></span>
        </li>
      </ul>
    </div>

    <!-- zoom -->
    <div class="event-map__zoom" @pointerdown.stop @dblclick.stop>
      <button type="button" aria-label="Zoom in" :disabled="zoom >= MAX_ZOOM" @click="zoomIn"><i class="bi bi-plus-lg"></i></button>
      <button type="button" aria-label="Zoom out" :disabled="zoom <= MIN_ZOOM" @click="zoomOut"><i class="bi bi-dash-lg"></i></button>
      <button type="button" aria-label="Show all events" title="Show all events" @click="fitAll()"><i class="bi bi-arrows-fullscreen"></i></button>
    </div>
  </div>
</template>

<style scoped>
.event-map {
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 420px;
  border: 1px solid var(--lrm-line);
  border-radius: var(--lrm-radius-card);
  background: var(--lrm-soft);
  isolation: isolate;
}
.event-map__leaflet {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--lrm-soft);
  font-family: var(--lrm-font-sans);
}

/* ---- markers (Leaflet puts them outside this component's scope, hence :deep) ---- */
.event-map :deep(.event-pin),
.event-map :deep(.you-pin) {
  background: none;
  border: 0;
}
/* event pin: a genre-coloured dot with a white ring, as in Figma */
.event-map :deep(.event-pin__dot) {
  position: absolute;
  left: -9px;
  top: -9px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--pin);
  box-shadow: 0 1px 4px rgba(var(--lrm-raw-rgb-000000), 0.35);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.event-map :deep(.event-pin.is-active .event-pin__dot) {
  transform: scale(1.3);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--pin) 30%, transparent), 0 2px 8px rgba(var(--lrm-raw-rgb-000000), 0.35);
}
/* name and time, in a frosted pill under the pin */
.event-map :deep(.event-pin__label) {
  position: absolute;
  left: 0;
  top: 14px;
  display: none;
  transform: translateX(-50%);
  padding: 5px 10px;
  border: 1px solid var(--lrm-line);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  color: var(--lrm-ink);
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
}
.event-map :deep(.event-pin.is-labelled .event-pin__label) {
  display: block;
}
.event-map :deep(.event-pin.is-active .event-pin__label) {
  font-weight: 600;
  border-color: var(--lrm-ink);
}
/* you are here: a soft circle around a dot. It does not pulse. */
.event-map :deep(.you-pin__area) {
  position: absolute;
  left: -36px;
  top: -36px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--lrm-info) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--lrm-info) 30%, transparent);
}
.event-map :deep(.you-pin__dot) {
  position: absolute;
  left: -9px;
  top: -9px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--lrm-info);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(var(--lrm-raw-rgb-000000), 0.35);
}
.event-map :deep(.leaflet-control-attribution) {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.85);
}

/* ---- overlays ---- */
.event-map__key {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 500;
  width: 190px;
  padding: 12px 13px;
  border: 1px solid var(--lrm-line);
  border-radius: 10px;
  background: #fff;
}
.event-map__key-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lrm-subtle);
}
.event-map__key-list {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  font-size: 12px;
  color: var(--lrm-ink);
}
.event-map__key-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}
.event-map__key-you {
  align-items: flex-start !important;
  margin-top: 8px;
  padding-top: 10px !important;
  border-top: 1px solid var(--lrm-divider);
}
.event-map__key-you .dot {
  margin-top: 3px;
}
.event-map__near {
  display: block;
  font-size: 10px;
  color: var(--lrm-subtle);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}
.dot--you {
  width: 10px;
  height: 10px;
  margin-left: -1px;
  background: var(--lrm-info);
}

.event-map__zoom {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  width: 40px;
  overflow: hidden;
  border: 1px solid var(--lrm-line);
  border-radius: 8px;
  background: #fff;
}
.event-map__zoom button {
  width: 38px;
  height: 39px;
  border: 0;
  background: transparent;
  font-size: 15px;
  color: var(--lrm-ink);
}
.event-map__zoom button + button {
  border-top: 1px solid var(--lrm-divider);
}
.event-map__zoom button:hover:not(:disabled) {
  background: var(--lrm-wash);
}
.event-map__zoom button:disabled {
  color: var(--lrm-faint);
}

@media (max-width: 575.98px) {
  .event-map__key {
    width: auto;
    min-width: 0;
  }
}

.event-map__hint {
  position: absolute;
  left: 50%;
  top: 15px;
  transform: translateX(-50%);
  z-index: 600;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: rgba(var(--lrm-raw-rgb-0c1e4a), 0.88);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  pointer-events: none;
  white-space: nowrap;
}
.zoom-hint-enter-active,
.zoom-hint-leave-active {
  transition: opacity 0.2s;
}
.zoom-hint-enter-from,
.zoom-hint-leave-to {
  opacity: 0;
}
</style>

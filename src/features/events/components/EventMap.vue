<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import SingaporeMapArt from './SingaporeMapArt.vue'
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  MAP_PAD_X,
  MAP_PAD_Y,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  project,
} from '../utils/mapProjection'

// Interactive map surface (pan / zoom / pins / genre key).
//
// This is the ONLY component that knows how the map is drawn. To switch to
// Google Maps (or similar), replace the contents of the `.event-map__world`
// block + the pan/zoom code with the API's map and keep the props/emits:
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
})
const emit = defineEmits(['select', 'open'])

const MAX_ZOOM = 2.5

const root = ref(null)
const size = reactive({ w: 0, h: 0 })
const zoom = ref(1)
const pan = reactive({ x: 0, y: 0 })
const dragging = ref(false)
const keyOpen = ref(typeof window === 'undefined' || window.innerWidth >= 768)

// the starting view fills the box with the centre picture (the area events are on)
const coverScale = computed(() => (size.w ? Math.max(size.w / MAP_WIDTH, size.h / MAP_HEIGHT) : 1))
// the furthest we can zoom out: the whole drawn map fills the box (never any empty edges)
const containScale = computed(() => (size.w ? Math.max(size.w / WORLD_WIDTH, size.h / WORLD_HEIGHT) : 1))
const baseScale = coverScale
const MIN_ZOOM = computed(() => containScale.value / coverScale.value) // can zoom out until everything is visible
const scale = computed(() => baseScale.value * zoom.value)

// smooth movement for button / focus actions (not while dragging or wheel-zooming)
const animating = ref(false)
let animTimer = null
function animate() {
  animating.value = true
  clearTimeout(animTimer)
  animTimer = setTimeout(() => (animating.value = false), 500)
}

const worldStyle = computed(() => ({
  width: `${WORLD_WIDTH}px`,
  height: `${WORLD_HEIGHT}px`,
  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale.value})`,
}))

// keep the picture inside the box (and centred when it is smaller than the box)
function clampPan() {
  const worldW = WORLD_WIDTH * scale.value
  const worldH = WORLD_HEIGHT * scale.value
  if (worldW <= size.w) pan.x = (size.w - worldW) / 2
  else pan.x = Math.min(0, Math.max(size.w - worldW, pan.x))
  if (worldH <= size.h) pan.y = (size.h - worldH) / 2
  else pan.y = Math.min(0, Math.max(size.h - worldH, pan.y))
}

/** Zoom keeping the world point under (cx, cy) fixed. */
function zoomAt(nextZoom, cx = size.w / 2, cy = size.h / 2) {
  const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM.value, nextZoom))
  const before = scale.value
  const wx = (cx - pan.x) / before
  const wy = (cy - pan.y) / before
  zoom.value = z
  const after = baseScale.value * z
  pan.x = cx - wx * after
  pan.y = cy - wy * after
  clampPan()
}

// the + and - buttons: a gentle step, animated
function zoomStep(factor) {
  animate()
  zoomAt(zoom.value * factor)
}

function centerOn(point, zoomLevel = zoom.value) {
  zoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM.value, zoomLevel))
  pan.x = size.w / 2 - point.x * scale.value
  pan.y = size.h / 2 - point.y * scale.value
  clampPan()
}

// "Show all events": zoom and move so that every pin is inside the box
function fitAll() {
  if (!pins.value.length) return
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const pin of pins.value) {
    minX = Math.min(minX, pin.point.x)
    maxX = Math.max(maxX, pin.point.x)
    minY = Math.min(minY, pin.point.y)
    maxY = Math.max(maxY, pin.point.y)
  }
  const padding = 120
  const width = Math.max(maxX - minX + padding * 2, 200)
  const height = Math.max(maxY - minY + padding * 2, 200)
  const wanted = Math.min(size.w / width, size.h / height) / baseScale.value
  animate()
  centerOn({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 }, wanted)
}

// ---- pointer interaction ---------------------------------------------------------
let drag = null

function onPointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return
  animating.value = false
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y, moved: false }
  root.value.setPointerCapture?.(e.pointerId)
}
function onPointerMove(e) {
  if (!drag || drag.id !== e.pointerId) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (!drag.moved && Math.hypot(dx, dy) < 4) return
  drag.moved = true
  dragging.value = true
  pan.x = drag.panX + dx
  pan.y = drag.panY + dy
  clampPan()
}
function onPointerUp(e) {
  if (drag?.id === e.pointerId) root.value.releasePointerCapture?.(e.pointerId)
  drag = null
  dragging.value = false
}
// Plain scrolling scrolls the page as usual. The map only zooms with
// Ctrl (or Cmd) + scroll, and shows a small reminder otherwise.
const zoomHint = ref(false)
let hintTimer = null

function onWheel(e) {
  if (!e.ctrlKey && !e.metaKey) {
    zoomHint.value = true
    clearTimeout(hintTimer)
    hintTimer = setTimeout(() => (zoomHint.value = false), 1200)
    return
  }
  e.preventDefault()
  const rect = root.value.getBoundingClientRect()
  // proportional to how far the wheel / pinch moved, so it never jumps
  const amount = Math.max(-25, Math.min(25, e.deltaY))
  zoomAt(zoom.value * Math.exp(-amount * 0.012), e.clientX - rect.left, e.clientY - rect.top)
}

// ---- sizing ----------------------------------------------------------------------
let observer
onMounted(() => {
  const measure = () => {
    const first = size.w === 0
    size.w = root.value.clientWidth
    size.h = root.value.clientHeight
    if (first) centerOn(userPoint.value)
    else clampPan()
  }
  observer = new ResizeObserver(measure)
  observer.observe(root.value)
  measure()
})
onBeforeUnmount(() => observer?.disconnect())

// ---- markers ---------------------------------------------------------------------
// positions are measured from the centre picture; the world has extra map around it
const toWorld = (point) => ({ x: point.x + MAP_PAD_X, y: point.y + MAP_PAD_Y })
const userPoint = computed(() => toWorld(project(props.userLocation)))

const genreById = computed(() => new Map(props.genres.map((g) => [g.id, g])))
const pins = computed(() =>
  props.events.map((e) => ({
    id: e.id,
    point: toWorld(project(e.venue)),
    color: genreById.value.get(e.genreId)?.hex || 'var(--lrm-blue)',
    label: `${e.headliner.name} - ${e.dowLabel} ${e.timeCompact}`,
  })),
)
const pinHoverId = ref(null) // the pin the mouse is over
const activeId = computed(() => props.hoverId || pinHoverId.value || props.selectedId)

const inverse = computed(() => 1 / scale.value)

// Bring the selected pin into view (smoothly) when it is chosen from a pin or a card.
watch(
  () => props.selectedId,
  async (id) => {
    if (!id) return
    const pin = pins.value.find((p) => p.id === id)
    if (!pin) return
    await nextTick()
    const sx = pin.point.x * scale.value + pan.x
    const sy = pin.point.y * scale.value + pan.y
    const margin = 90
    const visible = sx > margin && sx < size.w - margin && sy > margin && sy < size.h - margin
    if (!visible) {
      // far away: move there, but do not stay zoomed in too close
      animate()
      centerOn(pin.point, Math.min(zoom.value, 1.2))
    }
  },
)
</script>

<template>
  <div
    ref="root"
    class="event-map"
    :class="{ 'is-dragging': dragging, 'is-animating': animating }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel="onWheel"
  >
    <div class="event-map__world" :style="worldStyle">
      <SingaporeMapArt />

      <!-- your location -->
      <div class="event-map__marker event-map__marker--you" :style="{ left: `${userPoint.x}px`, top: `${userPoint.y}px`, '--inv': inverse }">
        <span class="event-map__you-wave"></span>
        <span class="event-map__you-wave event-map__you-wave--2"></span>
        <span class="event-map__you" title="You are here"></span>
      </div>

      <!-- event pins -->
      <div
        v-for="pin in pins"
        :key="pin.id"
        class="event-map__marker"
        :class="{ 'is-active': activeId === pin.id }"
        :style="{ left: `${pin.point.x}px`, top: `${pin.point.y}px`, '--inv': inverse }"
      >
        <button
          type="button"
          class="event-map__pin"
          :style="{ '--pin': pin.color }"
          :aria-label="pin.label"
          @pointerdown.stop
          @pointerenter="pinHoverId = pin.id"
          @pointerleave="pinHoverId = null"
          @click.stop="emit('select', pin.id)"
          @dblclick.stop="emit('open', pin.id)"
        ></button>
        <span v-if="activeId === pin.id" class="event-map__label">{{ pin.label }}</span>
      </div>
    </div>

    <!-- shown briefly when scrolling over the map -->
    <Transition name="zoom-hint">
      <div v-if="zoomHint" class="event-map__hint">Use Ctrl + scroll to zoom the map</div>
    </Transition>

    <!-- genre key -->
    <div class="event-map__key" @pointerdown.stop @wheel.stop>
      <button type="button" class="event-map__key-head" :aria-expanded="keyOpen" @click="keyOpen = !keyOpen">
        Genre key <i class="bi" :class="keyOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
      </button>
      <ul v-show="keyOpen" class="event-map__key-list">
        <li v-for="g in genres" :key="g.id"><span class="dot" :style="{ background: g.color }"></span>{{ g.label }}</li>
        <li class="event-map__key-you"><span class="dot dot--you"></span>Your location</li>
      </ul>
    </div>

    <!-- zoom -->
    <div class="event-map__zoom" @pointerdown.stop @wheel.stop>
      <button type="button" aria-label="Zoom in" :disabled="zoom >= MAX_ZOOM" @click="zoomStep(1.4)">
        <i class="bi bi-plus-lg"></i>
      </button>
      <button type="button" aria-label="Zoom out" :disabled="zoom <= MIN_ZOOM + 0.001" @click="zoomStep(1 / 1.4)">
        <i class="bi bi-dash-lg"></i>
      </button>
      <button type="button" aria-label="Show all events" title="Show all events" @click="fitAll">
        <i class="bi bi-arrows-fullscreen"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.event-map {
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 420px;
  border-radius: var(--lrm-radius);
  background: #efe8da;
  cursor: grab;
  touch-action: pan-y; /* a vertical swipe still scrolls the page */
  user-select: none;
}
.event-map.is-dragging {
  cursor: grabbing;
}

.event-map__world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}
.event-map.is-animating .event-map__world {
  transition: transform 0.45s ease;
}
/* pins and labels resize smoothly along with the animated zoom */
.event-map.is-animating .event-map__pin,
.event-map.is-animating .event-map__label,
.event-map.is-animating .event-map__you {
  transition: transform 0.45s ease;
}

.event-map__marker {
  position: absolute;
  width: 0;
  height: 0;
  z-index: 2;
}
.event-map__marker.is-active {
  z-index: 5;
}

.event-map__marker--you {
  z-index: 3;
}

/* "You are here": a dark dot with a white border, sending out soft waves in the LittleRedMusic colours */
.event-map__you-wave {
  position: absolute;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border: 2px solid #ff4d8d;
  border-radius: 50%;
  opacity: 0;
  transform: scale(var(--inv));
  animation: you-wave 2.4s ease-out infinite;
}
.event-map__you-wave--2 {
  border-color: #7c4dff;
  animation-delay: 1.2s;
}
@keyframes you-wave {
  0% {
    opacity: 0.85;
    transform: scale(calc(var(--inv) * 0.7));
  }
  100% {
    opacity: 0;
    transform: scale(calc(var(--inv) * 2.4));
  }
}
.event-map__you {
  position: absolute;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border-radius: 50%;
  background: #0b1220;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
  transform: scale(var(--inv));
}

/* Event pins: the classic map pin (a teardrop whose tip marks the venue) */
.event-map__pin {
  position: absolute;
  left: 0;
  top: -22px;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50% 50% 50% 0;
  background: var(--pin);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  transform-origin: 0 100%; /* the sharp corner is the tip, so it stays on the venue */
  transform: rotate(-45deg) scale(var(--inv));
  transition: box-shadow 0.15s;
  cursor: pointer;
}
.event-map__pin::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: #fff;
}
.event-map__marker.is-active .event-map__pin {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--pin) 40%, transparent), 0 3px 10px rgba(0, 0, 0, 0.45);
  transform: rotate(-45deg) scale(calc(var(--inv) * 1.25));
}

.event-map__label {
  position: absolute;
  left: 0;
  bottom: 0;
  /* the pin head reaches about 31px above its tip (39px when selected), so keep well clear of it */
  transform: translate(-50%, -52px) scale(var(--inv));
  transform-origin: 50% 100%;
  padding: 0.38rem 0.85rem;
  border-radius: 999px;
  background: #fff;
  color: var(--lrm-ink);
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(20, 35, 90, 0.2);
  pointer-events: none;
  animation: label-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
/* little arrow pointing down at the pin */
.event-map__label::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: 2px;
  background: #fff;
  transform: rotate(45deg);
}
@keyframes label-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -30px) scale(calc(var(--inv) * 0.55));
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -52px) scale(var(--inv));
  }
}

/* overlays */
.event-map__key {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  min-width: 190px;
  padding: 0.7rem 0.9rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--lrm-shadow);
  cursor: default;
}
.event-map__key-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lrm-muted);
}
.event-map__key-list {
  list-style: none;
  margin: 0.55rem 0 0;
  padding: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--lrm-ink);
}
.event-map__key-list li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.18rem 0;
}
.event-map__key-you {
  margin-top: 0.4rem;
  padding-top: 0.55rem !important;
  border-top: 1px solid var(--lrm-border);
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex: none;
}
.dot--you {
  background: #0b1220;
  box-shadow: 0 0 0 2px #fff, 0 0 0 3px #d9deee;
}

.event-map__zoom {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: var(--lrm-shadow);
}
.event-map__zoom button {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  font-size: 1.1rem;
  color: var(--lrm-ink);
}
.event-map__zoom button + button {
  border-top: 1px solid var(--lrm-border);
}
.event-map__zoom button:hover:not(:disabled) {
  background: #eef1fb;
}
.event-map__zoom button:disabled {
  color: var(--lrm-faint);
}

@media (max-width: 575.98px) {
  .event-map__key {
    min-width: 0;
  }
}

.event-map__hint {
  position: absolute;
  left: 50%;
  top: 14px;
  transform: translateX(-50%);
  z-index: 11;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: rgba(12, 30, 74, 0.88);
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

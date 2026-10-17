<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import EventsShell from '../components/EventsShell.vue'
import EventMap from '../components/EventMap.vue'
import EventMapCard from '../components/EventMapCard.vue'
import SortDropdown from '../components/SortDropdown.vue'
import { SORTS, useEventFilters } from '../composables/useEventFilters'

const router = useRouter()
const TRAY_HEIGHT = 112 + 15 // card height + gap to the map's edge
const filters = useEventFilters()

const selectedId = ref(null) // the pin that was clicked
const highlightId = ref(null) // its card, highlighted once the strip has stopped scrolling
const hoverId = ref(null)
const cardsEl = ref(null)
let highlightTimer = null

function open(id) {
  router.push({ name: 'event-detail', params: { id } })
}

// Pin click → scroll its card into view (clicking the same pin again un-selects it), then highlight the card once the
// strip has stopped moving, so it is obvious which event was picked.
function select(id) {
  clearInterval(highlightTimer)

  // clicking the selected pin again removes the highlight
  if (selectedId.value === id) {
    selectedId.value = null
    highlightId.value = null
    return
  }

  selectedId.value = id
  highlightId.value = null

  const strip = cardsEl.value
  const card = strip?.querySelector(`[data-event-id="${id}"]`)
  if (!card) {
    highlightId.value = id
    return
  }

  // where the card is inside the (horizontally scrolling) strip
  const cardLeft = card.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft
  // keep a margin so the glow is not cut off, but never ask for more than the strip can scroll
  // (the last cards cannot reach the left edge, which used to make the highlight wait)
  const maxScroll = strip.scrollWidth - strip.clientWidth
  const target = Math.min(maxScroll, Math.max(0, cardLeft - 28))
  if (Math.abs(strip.scrollLeft - target) < 2) {
    // already in view: highlight straight away
    highlightId.value = id
    return
  }

  strip.scrollTo({ left: target, behavior: 'smooth' })
  // the cards are under the map, so make sure the strip itself is on screen too
  strip.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

  // check every 80ms: highlight when the strip arrives (or has stopped moving)
  const startPosition = strip.scrollLeft
  let lastPosition = startPosition
  let moved = false
  let stillTicks = 0
  let ticks = 0
  highlightTimer = setInterval(() => {
    ticks++
    const now = strip.scrollLeft
    if (now !== startPosition) moved = true
    if (now === lastPosition) stillTicks++
    else stillTicks = 0
    lastPosition = now

    const arrived = Math.abs(now - target) < 2
    const stopped = moved && stillTicks >= 4
    const notMoving = !moved && ticks > 6 // nothing to scroll, so do not keep the user waiting
    if (arrived || stopped || notMoving || ticks > 40) {
      clearInterval(highlightTimer)
      highlightId.value = id
    }
  }, 80)
}

// Sorting only re-arranges the cards: show the row from its first card, in the new order.
// (It must not jump to the selected event, which is where the browser would otherwise
// keep the row scrolled to - see overflow-anchor below.)
watch(filters.sort, async () => {
  clearInterval(highlightTimer)
  await nextTick() // wait until the cards have been re-ordered
  cardsEl.value?.scrollTo({ left: 0, behavior: 'auto' })
})

// Drop a selection that's been filtered out.
watch(filters.results, (list) => {
  if (selectedId.value && !list.some((e) => e.id === selectedId.value)) {
    selectedId.value = null
    highlightId.value = null
  }
})
</script>

<template>
  <EventsShell view="map">
    <template #actions>
      <SortDropdown v-model="filters.sort.value" :options="SORTS" />
    </template>

    <template #default="{ events }">
      <!-- as in Figma: the event cards sit in a row over the bottom of the map -->
      <div class="map-stage">
        <EventMap
          :events="events"
          :genres="filters.genres.value"
          :user-location="filters.user.value.location"
          :selected-id="selectedId"
          :hover-id="hoverId"
          :bottom-inset="TRAY_HEIGHT"
          @select="select"
          @open="open"
        />

        <div ref="cardsEl" class="map-stage__cards" aria-label="Events on the map">
          <div v-for="e in events" :key="e.id" :data-event-id="e.id" class="map-stage__card-wrap">
            <EventMapCard
              :event="e"
              :active="highlightId === e.id"
              @hover="hoverId = $event"
            />
          </div>
        </div>
      </div>
    </template>
  </EventsShell>
</template>

<style scoped>
.map-stage {
  position: relative;
  height: clamp(460px, 62vh, 640px);
}
.map-stage > :deep(.event-map) {
  position: absolute;
  inset: 0;
  height: auto;
  min-height: 0;
}
/* wide screens: the map fills whatever height is left in the window */
@media (min-width: 992px) {
  .map-stage {
    height: 100%;
    min-height: 0;
  }
}

/* the event cards: a row over the bottom of the map (15px in from its edges, 20px apart) */
.map-stage__cards {
  position: absolute;
  left: 1px;
  right: 1px;
  bottom: 1px;
  z-index: 550;
  display: flex;
  gap: 20px;
  padding: 10px 15px 15px;
  overflow-x: auto;
  overflow-anchor: none; /* do not follow a card to its new place when the order changes */
  scrollbar-width: none;
  border-radius: 0 0 var(--lrm-radius-card) var(--lrm-radius-card);
  pointer-events: none; /* the map stays draggable between the cards */
}
.map-stage__cards::-webkit-scrollbar {
  display: none;
}
.map-stage__card-wrap {
  display: flex;
  flex: 0 0 300px;
  pointer-events: auto;
}
</style>

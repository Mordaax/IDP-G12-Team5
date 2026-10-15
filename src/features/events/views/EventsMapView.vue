<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import EventsShell from '../components/EventsShell.vue'
import EventMap from '../components/EventMap.vue'
import EventMapCard from '../components/EventMapCard.vue'
import SortDropdown from '../components/SortDropdown.vue'
import { SORTS, useEventFilters } from '../composables/useEventFilters'

const router = useRouter()
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
      <div class="map-stage">
        <div class="map-stage__map">
        <EventMap
          :events="events"
          :genres="filters.genres.value"
          :user-location="filters.user.value.location"
          :selected-id="selectedId"
          :hover-id="hoverId"
          @select="select"
          @open="open"
        />
        </div>

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
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.map-stage__map {
  position: relative;
  height: clamp(400px, 56vh, 540px);
  border-radius: var(--lrm-radius);
  box-shadow: var(--lrm-shadow);
}
.map-stage__map > :deep(.event-map) {
  position: absolute;
  inset: 0;
  height: auto;
  min-height: 0;
}

/* wide screens: the map grows to fill whatever height is left above the card row */
@media (min-width: 992px) {
  .map-stage {
    height: 100%;
  }
  .map-stage__map {
    height: auto;
    flex: 1 1 0;
    min-height: 400px;
  }
}

/* the event cards sit directly below the map */
.map-stage__cards {
  display: flex;
  gap: 14px;
  /* room around the cards, so a selected card's lift and glow are never cut off */
  padding: 14px 28px 26px;
  overflow-x: auto;
  overflow-anchor: none; /* do not follow a card to its new place when the order changes */
  scrollbar-width: thin;
}
/* the flex padding at the end of a scrolling row is ignored by some browsers */
.map-stage__cards::after {
  content: '';
  flex: 0 0 1px;
}
.map-stage__card-wrap {
  display: flex;
  flex: 0 0 min(300px, 80%);
}
</style>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EventFilterSidebar from './EventFilterSidebar.vue'
import { useEventFilters } from '../composables/useEventFilters'

// Layout shared by the Map and List screens: title, Map/List toggle, filter
// sidebar, and a results slot. Owns loading / error / empty states so the two
// views only have to render a non-empty result set.
defineProps({
  view: { type: String, required: true }, // 'map' | 'list'
})

const route = useRoute()
const filters = useEventFilters()
const filtersOpen = ref(false) // mobile only

const count = computed(() => filters.results.value.length)

const subtitle = computed(() => {
  const n = count.value
  const noun = `${n} event${n === 1 ? '' : 's'}`
  if (filters.artistSummary.value) return `${noun} featuring ${filters.artistSummary.value}`
  if (filters.venueName.value) return `${noun} at ${filters.venueName.value}`
  if (filters.applied.q.trim()) return `${noun} matching “${filters.applied.q.trim()}”`
  return `${noun} coming up near you`
})

onMounted(() => filters.init(route.query))
watch(() => route.query, (q) => filters.ready.value && filters.applyQuery(q))
</script>

<template>
  <div class="events-shell container-xxl">
    <header class="events-shell__head">
      <div>
        <h1 class="events-shell__title">Events</h1>
        <p class="events-shell__subtitle" aria-live="polite">{{ subtitle }}</p>
      </div>

      <div class="events-shell__actions">
        <div class="events-shell__sort"><slot name="actions" /></div>

      <div class="view-toggle" role="group" aria-label="Events view">
        <RouterLink :to="{ name: 'events-map' }" class="view-toggle__btn" :class="{ 'is-active': view === 'map' }" :aria-current="view === 'map' ? 'page' : undefined">
          Map
        </RouterLink>
        <RouterLink :to="{ name: 'events-list' }" class="view-toggle__btn" :class="{ 'is-active': view === 'list' }" :aria-current="view === 'list' ? 'page' : undefined">
          List
        </RouterLink>
      </div>
      </div>
    </header>

    <button
      type="button"
      class="events-shell__filter-toggle d-lg-none"
      :aria-expanded="filtersOpen"
      aria-controls="events-filters"
      @click="filtersOpen = !filtersOpen"
    >
      <i class="bi bi-sliders"></i>
      Filters
      <span v-if="filters.activeCount.value" class="events-shell__badge">{{ filters.activeCount.value }}</span>
      <i class="bi ms-auto" :class="filtersOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </button>

    <div class="events-shell__body">
      <div id="events-filters" class="events-shell__sidebar" :class="{ 'is-open': filtersOpen }">
        <EventFilterSidebar v-if="filters.ready.value" @applied="filtersOpen = false" />
      </div>

      <section class="events-shell__main" :class="{ 'is-stretched': view === 'map' }">
        <button v-if="filters.applied.venue" type="button" class="events-shell__chip" @click="filters.clearVenue()">
          At {{ filters.venueName.value }} <i class="bi bi-x-lg"></i>
        </button>

        <div v-if="filters.loading.value && !filters.ready.value" class="events-shell__state">
          <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading events…</span></div>
        </div>

        <div v-else-if="filters.error.value" class="events-shell__state">
          <i class="bi bi-exclamation-triangle fs-1 text-warning"></i>
          <p class="mb-3">{{ filters.error.value }}</p>
          <button class="btn btn-lrm" @click="filters.init(route.query)">Try again</button>
        </div>

        <div v-else-if="!count" class="events-shell__state">
          <i class="bi bi-calendar-x fs-1 text-secondary"></i>
          <h2 class="h5 mt-2">No events match these filters</h2>
          <p class="text-secondary">Try a wider distance, a later date, or fewer genres.</p>
          <button class="btn btn-lrm" @click="filters.reset()">Reset filters</button>
        </div>

        <slot v-else :events="filters.results.value" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.events-shell {
  padding-top: 1.1rem;
  padding-bottom: 2.5rem;
}

.events-shell__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}
.events-shell__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}
.events-shell__sort:empty {
  display: none;
}
.events-shell__title {
  margin: 0;
  font-size: 2.3rem;
  line-height: 1.1;
}
.events-shell__subtitle {
  margin: 0.2rem 0 0;
  font-size: 1.05rem;
  color: var(--lrm-muted);
  font-weight: 500;
}

.view-toggle {
  display: inline-flex;
  padding: 5px;
  border-radius: 14px;
  background: #e9ecf6;
}
.view-toggle__btn {
  min-width: 96px;
  padding: 0.55rem 1.2rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 700;
  color: var(--lrm-muted);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.view-toggle__btn:hover {
  color: var(--lrm-ink);
}
.view-toggle__btn.is-active {
  background: var(--lrm-navy);
  color: #fff;
}

.events-shell__filter-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 0.9rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--lrm-border);
  border-radius: 12px;
  background: #fff;
  font-weight: 700;
  color: var(--lrm-ink);
}
.events-shell__badge {
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--lrm-coral);
  color: #fff;
  font-size: 0.75rem;
  line-height: 22px;
  text-align: center;
}

.events-shell__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.4rem;
  align-items: start;
}
.events-shell__sidebar {
  display: none;
}
.events-shell__sidebar.is-open {
  display: block;
}
.events-shell__main {
  min-width: 0;
}

.events-shell__chip {
  margin-bottom: 0.8rem;
  padding: 0.35rem 0.8rem;
  border: 0;
  border-radius: 999px;
  background: #e5ebff;
  color: var(--lrm-blue);
  font-weight: 700;
  font-size: 0.85rem;
}

.events-shell__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 2rem;
  text-align: center;
  border-radius: var(--lrm-radius);
  background: #fff;
  border: 1px dashed var(--lrm-border);
}

@media (min-width: 992px) {
  .events-shell__body {
    grid-template-columns: 300px minmax(0, 1fr);
  }

  /* header uses the same two columns as the page below it:
     the title above the filters, and the controls above the results */
  .events-shell__head {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    column-gap: 1.4rem;
    align-items: start;
  }
  .events-shell__actions {
    justify-content: flex-end;
    gap: 1.5rem; /* clear space between Sort and the Map / List switch */
  }

  .events-shell__sidebar {
    display: block;
    position: sticky;
    top: calc(var(--navbar-height) + 16px);
  }

  /* The filter card is the thing that scrolls (so its rounded corners always show whole),
     with the scrollbar on its left side and Apply pinned at its bottom. */
  .events-shell__sidebar > :deep(.filters) {
    max-height: calc(100vh - var(--navbar-height) - 32px);
    overflow-y: auto;
    overflow-x: hidden; /* the heart's falling notes must not make a sideways scrollbar */
    direction: rtl; /* puts the scrollbar on the left ... */
  }
  .events-shell__sidebar > :deep(.filters) > * {
    direction: ltr; /* ... while the content itself stays left-to-right */
  }

  /* the map column is as tall as the filter panel, so the scrollbar under the
     event cards ends exactly where the filter panel ends */
  .events-shell__main.is-stretched {
    align-self: stretch;
    display: flex;
    flex-direction: column;
  }
  .events-shell__main.is-stretched > :deep(.map-stage) {
    flex: 1 1 auto;
  }
}

@media (max-width: 991.98px) {
  .events-shell__head {
    flex-wrap: wrap;
  }
  .events-shell__actions {
    flex: 1 1 100%;
    justify-content: space-between;
  }
}

@media (max-width: 575.98px) {
  .events-shell__title {
    font-size: 2rem;
  }
  .view-toggle__btn {
    min-width: 72px;
    padding-inline: 0.8rem;
  }
}
</style>

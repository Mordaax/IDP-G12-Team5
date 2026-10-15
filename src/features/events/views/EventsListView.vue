<script setup>
import EventsShell from '../components/EventsShell.vue'
import EventListCard from '../components/EventListCard.vue'
import SortDropdown from '../components/SortDropdown.vue'
import { SORTS, useEventFilters } from '../composables/useEventFilters'

const filters = useEventFilters()
</script>

<template>
  <EventsShell view="list">
    <template #actions>
      <SortDropdown v-model="filters.sort.value" :options="SORTS" />
    </template>

    <template #default="{ events }">
      <div class="events-list__grid">
        <EventListCard v-for="e in events" :key="e.id" :event="e" />
      </div>
    </template>
  </EventsShell>
</template>

<style scoped>
.events-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.1rem;
}
</style>

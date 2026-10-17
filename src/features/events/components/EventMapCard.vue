<script setup>
import { computed } from 'vue'
import EventCover from './EventCover.vue'
import { cardStamp } from '../utils/date'
import { formatDistance } from '../utils/geo'

const props = defineProps({
  event: { type: Object, required: true },
  active: { type: Boolean, default: false },
})
defineEmits(['open', 'hover', 'select'])

const stamp = computed(() => cardStamp(props.event.startsAt))
const priceLabel = computed(() => (props.event.free ? 'Free' : `$${props.event.price}`))
const friendsLabel = computed(() => {
  const n = props.event.friends.length
  return `${n} friend${n === 1 ? '' : 's'}`
})
</script>

<template>
  <article
    class="map-card"
    :class="{ 'is-active': active }"
    :style="{ '--genre': event.genre.color }"
    @mouseenter="$emit('hover', event.id)"
    @mouseleave="$emit('hover', null)"
  >
    <RouterLink
      :to="{ name: 'event-detail', params: { id: event.id } }"
      class="map-card__link"
      :aria-label="`${event.title}, ${stamp}. View event`"
      @focus="$emit('hover', event.id)"
      @blur="$emit('hover', null)"
    >
      <div class="map-card__head">
        <span class="map-card__stamp">{{ stamp }}</span>
        <span class="map-card__price">{{ priceLabel }}</span>
      </div>
      <div class="map-card__body">
        <div class="map-card__thumb">
          <EventCover :palette="event.palette" :seed="event.id" />
          <i class="map-card__dot" :title="event.genre.label"></i>
        </div>
        <div class="map-card__info">
          <h3 class="map-card__title">{{ event.headliner.name }}</h3>
          <p class="map-card__venue">{{ event.venue.label }} · {{ formatDistance(event.distanceKm) }}</p>
          <p class="map-card__meta">
            {{ event.going }} going<template v-if="event.friends.length"> · {{ friendsLabel }}</template>
          </p>
        </div>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
/* Figma "📸 13 Events (Map) Filtered" → tray-card: 300 × 112, white, 1px border, 10px corners */
.map-card {
  width: 100%;
  height: 112px;
  border: 1px solid var(--lrm-line);
  border-radius: 10px;
  background: #fff;
  box-shadow: var(--lrm-shadow-card);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.map-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--lrm-shadow-pop);
}
/* the card of the pin that was clicked */
.map-card.is-active {
  border-color: var(--lrm-ink);
  box-shadow: 0 0 0 1px var(--lrm-ink), var(--lrm-shadow-pop);
}
.map-card__link {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  padding: 9px 15px 12px;
  color: inherit;
  text-decoration: none;
}
.map-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.map-card__stamp {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--lrm-subtle);
  white-space: nowrap;
}
.map-card__price {
  min-width: 52px;
  padding: 3px 10px;
  border: 1px solid var(--lrm-line);
  border-radius: 12px;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: var(--lrm-muted);
}
.map-card__body {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.map-card__thumb {
  position: relative;
  flex: none;
  width: 40px;
  height: 40px;
  margin-top: 2px;
  border-radius: 50%;
  overflow: hidden;
}
.map-card__thumb :deep(.event-cover) {
  width: 100%;
  height: 100%;
  border-radius: 0;
}
.map-card__dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--genre);
  border: 2px solid #fff;
}
.map-card__info {
  min-width: 0;
  flex: 1;
}
.map-card__title {
  margin: 0 0 3px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-card__venue,
.map-card__meta {
  margin: 0;
  font-size: 12px;
  line-height: 1.3;
  color: var(--lrm-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-card__meta {
  margin-top: 4px;
  font-size: 10px;
  color: var(--lrm-subtle);
}
</style>

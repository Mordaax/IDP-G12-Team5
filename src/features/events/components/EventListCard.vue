<script setup>
import { computed } from 'vue'
import EventCover from './EventCover.vue'
import FriendStack from './FriendStack.vue'
import { dowUpper, monthShort } from '../utils/date'
import { formatDistance } from '../utils/geo'
import { useSavedEvents } from '../composables/useSavedEvents'
import { toast } from '@/composables/useToast'

const props = defineProps({ event: { type: Object, required: true } })

const { isSaved, toggle } = useSavedEvents()
const saved = computed(() => isSaved(props.event.id))

const priceLabel = computed(() => (props.event.free ? 'Free' : `$${props.event.price}`))
const friendCount = computed(() => props.event.friends.length)
const mainTag = computed(() => props.event.tags[0])

function onHeart() {
  const nowSaved = toggle(props.event.id)
  toast(nowSaved ? 'Saved to your events' : 'Removed from saved events')
}
</script>

<template>
  <article class="list-card lrm-card" :style="{ '--genre': event.genre.color }">
    <div class="list-card__media">
      <EventCover :palette="event.palette" :seed="event.id" :label="event.headliner.name">
        <div class="list-card__date" aria-hidden="true">
          <span class="list-card__dow">{{ dowUpper(event.startsAt) }}</span>
          <strong>{{ event.startsAt.getDate() }}</strong>
          <span class="list-card__month">{{ monthShort(event.startsAt).toUpperCase() }}</span>
        </div>
        <span class="list-card__genre"><i class="dot"></i>{{ event.genre.label }}</span>
      </EventCover>
      <button
        type="button"
        class="list-card__heart"
        :class="{ 'is-saved': saved }"
        :aria-pressed="saved"
        :aria-label="saved ? 'Remove from saved events' : 'Save event'"
        @click="onHeart"
      >
        <i class="bi" :class="saved ? 'bi-heart-fill' : 'bi-heart'"></i>
      </button>
    </div>

    <div class="list-card__body">
      <h3 class="list-card__title">
        <RouterLink :to="{ name: 'event-detail', params: { id: event.id } }" class="stretched-link">
          {{ event.title }}
        </RouterLink>
      </h3>
      <p class="list-card__venue">{{ event.venue.label }} · {{ formatDistance(event.distanceKm) }}</p>
      <p class="list-card__time">{{ event.timeLabel }}</p>

      <p v-if="friendCount" class="list-card__friends">
        <FriendStack :friends="event.friends" :size="28" />
        <span>{{ friendCount }} friend{{ friendCount === 1 ? '' : 's' }} going</span>
      </p>

      <div class="list-card__chips">
        <span v-if="mainTag" class="chip chip--tag">#{{ mainTag }}</span>
        <span class="chip chip--price">{{ priceLabel }}</span>
        <span class="chip chip--going">{{ event.going }} going</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.list-card {
  position: relative;
  overflow: hidden; /* keeps the shine inside the card */
  padding: 0.7rem;
  /* springy pop on hover, same feel as the cards on the map page */
  transition:
    transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s,
    background 0.3s;
  animation: card-in 0.35s ease backwards;
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* hover (or keyboard focus): the card lifts, takes its genre colour and glows */
.list-card:hover,
.list-card:focus-within {
  transform: translateY(-6px) scale(1.02);
  background: linear-gradient(180deg, color-mix(in srgb, var(--genre) 10%, #fff), #fff 65%);
  box-shadow:
    0 0 0 2px var(--genre),
    0 16px 30px color-mix(in srgb, var(--genre) 35%, transparent);
}

/* a light sweep across the card, repeating while it is hovered */
.list-card::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 45%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.75), transparent);
  transform: skewX(-18deg);
  opacity: 0;
  pointer-events: none;
}
.list-card:hover::after,
.list-card:focus-within::after {
  opacity: 1;
  animation: list-card-shine 1.9s ease-in-out infinite;
}
@keyframes list-card-shine {
  0% {
    left: -60%;
  }
  80%,
  100% {
    left: 130%;
  }
}

.list-card__media {
  position: relative;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
}
.list-card__media :deep(.event-cover) {
  height: 100%;
}

.list-card__date {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 52px;
  padding: 0.25rem 0.5rem 0.3rem;
  border-radius: 10px;
  background: #fff;
  border: 2px solid var(--genre);
  line-height: 1.1;
}
.list-card__dow {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--genre);
}
.list-card__date strong {
  font-size: 1.35rem;
  color: var(--lrm-ink);
}
.list-card__month {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--lrm-muted);
}

.list-card__genre {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: #fff;
  color: var(--lrm-ink);
  font-size: 0.8rem;
  font-weight: 700;
}
.list-card__genre .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--genre);
}

.list-card__heart {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #ee4a4a;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s;
}
.list-card__heart:hover {
  transform: scale(1.08);
}
.list-card__heart:not(.is-saved) {
  color: var(--lrm-muted);
}

.list-card__body {
  padding: 0.85rem 0.35rem 0.4rem;
}
.list-card__title {
  margin: 0;
  font-size: 1.12rem;
  line-height: 1.25;
}
.list-card__title a {
  color: var(--lrm-ink);
  text-decoration: none;
}
.list-card__venue,
.list-card__time {
  margin: 0.2rem 0 0;
  color: var(--lrm-muted);
  font-size: 0.95rem;
}
.list-card__time {
  font-size: 0.85rem;
  color: var(--lrm-faint);
}
.list-card__friends {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.65rem 0 0;
  color: var(--lrm-muted);
  font-size: 0.92rem;
}

.list-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.8rem;
}
.chip {
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}
.chip--tag {
  background: #ece9ff;
  color: #5b45c9;
}
.chip--price {
  background: color-mix(in srgb, var(--genre) 14%, #fff);
  color: var(--genre);
}
.chip--going {
  background: #e6efff;
  color: #2d5fd0;
}
</style>

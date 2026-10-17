<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import EventCover from '../components/EventCover.vue'
import ArtistAvatar from '../components/ArtistAvatar.vue'
import FriendStack from '../components/FriendStack.vue'
import EventDiscussion from '../components/EventDiscussion.vue'
import { useEventsData } from '../composables/useEventsData'
import { useSavedEvents } from '../composables/useSavedEvents'
import { dayLabel, dayLabelYear } from '../utils/date'
import { formatDistance, mapsDirectionsUrl, mapsSearchUrl } from '../utils/geo'
import { toast } from '@/composables/useToast'
import { ROUTES } from '@/data'
import { requireLogin } from '@/lib/session'

const props = defineProps({
  id: { type: String, required: true },
  initialTab: { type: String, default: 'details' }, // /events/:id/discussions opens on Discussions
})

const router = useRouter()
const data = useEventsData()
const { isSaved, toggle } = useSavedEvents()

const tab = ref(props.initialTab)
const showAttendees = ref(false)

onMounted(() => data.load())

const event = computed(() => data.getEvent(props.id))
const saved = computed(() => (event.value ? isSaved(event.value.id) : false))

// Reset UI state when navigating between events (e.g. via "More at …").
watch(() => props.id, () => {
  tab.value = props.initialTab
  showAttendees.value = false
  window.scrollTo({ top: 0 })
})

const moreAtVenue = computed(() =>
  event.value
    ? data.events.value
        .filter((e) => e.venueId === event.value.venueId && e.id !== event.value.id && e.dayOffset >= 0)
        .sort((a, b) => a.startsAt - b.startsAt)
        .slice(0, 3)
    : [],
)

const friendSentence = computed(() => {
  const names = event.value.friends.map((f) => f.name)
  if (!names.length) return 'None of your friends are going yet'
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
  return `${list} ${names.length === 1 ? 'is' : 'are'} going`
})

const otherAttendees = computed(() => Math.max(0, event.value.going - event.value.friends.length))

const detailTiles = computed(() => {
  const e = event.value
  return [
    { icon: 'bi-calendar-event-fill', tone: 'rose', label: 'Date & time', value: `${dayLabelYear(e.startsAt)} · ${e.timeLabel}` },
    {
      icon: 'bi-ticket-perforated-fill',
      tone: 'amber',
      label: 'Set times',
      lines: e.setTimes.map((s) => `${s.artist.name} ${s.time}`),
    },
    { icon: 'bi-clock-fill', tone: 'violet', label: 'Doors', value: `${e.doorsLabel} · First set ${e.timeLabel}` },
    { icon: 'bi-people-fill', tone: 'blue', label: 'Entry', value: e.entry },
    {
      icon: 'bi-geo-alt-fill',
      tone: 'green',
      label: 'Venue',
      value: `${e.venue.address} · ${formatDistance(e.distanceKm)}`,
      link: { text: 'View on map', href: mapsSearchUrl(e.venue) },
    },
    {
      icon: 'bi-bus-front-fill',
      tone: 'orange',
      label: 'Getting there',
      value: e.venue.transit,
      link: { text: 'Plan route', href: mapsDirectionsUrl(e.venue) },
    },
  ]
})

function back() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'events-map' })
}

function onSave() {
  requireLogin(() => toast(toggle(event.value.id) ? 'Event saved' : 'Removed from saved events'))
}

async function onShare() {
  const e = event.value
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: e.heroTitle, text: `${e.heroTitle} on LittleRedMusic`, url })
      return
    }
    await navigator.clipboard.writeText(url)
    toast('Link copied to clipboard')
  } catch (err) {
    if (err?.name !== 'AbortError') toast('Could not share this event')
  }
}
</script>

<template>
  <div class="container-fluid event-page">
    <!-- loading -->
    <div v-if="data.loading.value && !event" class="event-page__state">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading event…</span></div>
    </div>

    <!-- not found -->
    <div v-else-if="!event" class="event-page__state">
      <i class="bi bi-calendar-x fs-1 text-secondary"></i>
      <h1 class="h4 mt-2">We couldn't find that event</h1>
      <p class="text-secondary">It may have ended or the link is out of date.</p>
      <button class="btn btn-lrm" @click="back">Back to Events</button>
    </div>

    <template v-else>
      <!-- Hero -->
      <section class="hero" :style="{ '--genre': event.genre.color }">
        <EventCover class="hero__cover" :palette="event.palette" :seed="event.id" />
        <div class="hero__scrim"></div>

        <div class="hero__inner">
          <button type="button" class="hero__back" @click="back"><i class="bi bi-arrow-left"></i> Back to Events</button>

          <div class="hero__bottom">
            <div class="hero__text">
              <div class="hero__chips">
                <span class="hero__chip">{{ dayLabel(event.startsAt).toUpperCase() }} · {{ event.timeLabel }}</span>
                <span class="hero__chip hero__chip--genre"><i class="dot"></i>{{ event.genre.label.toUpperCase() }}</span>
              </div>
              <h1 class="hero__title">{{ event.heroTitle }}</h1>
            </div>

            <div class="hero__actions">
              <a class="btn hero__btn hero__btn--primary" :href="event.ticketUrl" target="_blank" rel="noopener noreferrer">
                Get tickets <i class="bi bi-arrow-up-right"></i>
              </a>
              <button type="button" class="btn hero__btn" :aria-pressed="saved" @click="onSave">
                <i class="bi" :class="saved ? 'bi-bookmark-fill' : 'bi-bookmark'"></i>
                {{ saved ? 'Saved' : 'Save event' }}
              </button>
              <button type="button" class="btn hero__btn" @click="onShare">
                <i class="bi bi-box-arrow-up"></i> Share
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <div class="event-tabs" role="tablist">
        <button
          v-for="t in [{ id: 'details', label: 'Details' }, { id: 'discussions', label: 'Discussions' }]"
          :key="t.id"
          type="button"
          role="tab"
          class="event-tabs__tab"
          :class="{ 'is-active': tab === t.id }"
          :aria-selected="tab === t.id"
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="event-layout">
        <!-- Main column -->
        <div class="event-layout__main">
          <template v-if="tab === 'details'">
            <section class="lrm-card event-section">
              <h2 class="event-section__title">About this event</h2>
              <p class="event-about">{{ event.about }}</p>

              <h2 class="event-section__title mt-4">Line-up</h2>
              <ul class="lineup">
                <li v-for="l in event.lineup" :key="l.artist.id" class="lineup__item">
                  <!-- FallingIslands has an artist page (React); other artists open their gigs -->
                  <component
                    :is="l.artist.id === 'fallingislands' ? 'a' : RouterLink"
                    v-bind="l.artist.id === 'fallingislands' ? { href: ROUTES.artist } : { to: { name: 'events-list', query: { artist: l.artist.id } } }"
                    class="lineup__link"
                  >
                    <ArtistAvatar :name="l.artist.name" :hue="l.artist.hue" :size="62" />
                    <span>
                      <strong>{{ l.artist.name }}</strong>
                      <span class="lineup__role" :class="{ 'is-headliner': l.role === 'Headliner' }">{{ l.role }}</span>
                    </span>
                  </component>
                </li>
              </ul>

              <h2 class="event-section__title mt-4">Event details</h2>
              <div class="tiles">
                <div v-for="t in detailTiles" :key="t.label" class="tile">
                  <span class="tile__icon" :class="`tone-${t.tone}`"><i class="bi" :class="t.icon"></i></span>
                  <div class="tile__text">
                    <span class="tile__label">{{ t.label }}</span>
                    <template v-if="t.lines">
                      <span v-for="line in t.lines" :key="line" class="tile__value">{{ line }}</span>
                    </template>
                    <span v-else class="tile__value">{{ t.value }}</span>
                    <a v-if="t.link" :href="t.link.href" target="_blank" rel="noopener noreferrer" class="tile__link">
                      {{ t.link.text }} <i class="bi bi-arrow-up-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </template>

          <EventDiscussion v-else :event-id="event.id" />
        </div>

        <!-- Side column -->
        <aside class="event-layout__side">
          <section class="lrm-card event-section">
            <div class="side-head">
              <h2 class="event-section__title m-0">Who's going</h2>
              <span class="side-head__icon tone-blue"><i class="bi bi-people-fill"></i></span>
            </div>

            <div class="going-stats">
              <div><strong>{{ event.going }}</strong><span>going</span></div>
              <div><strong>{{ event.friends.length }}</strong><span>friends from Spotify</span></div>
            </div>

            <p class="going-friends">
              <FriendStack v-if="event.friends.length" :friends="event.friends" :size="34" />
              <span>{{ friendSentence }}</span>
            </p>

            <button
              type="button"
              class="going-btn"
              :aria-expanded="showAttendees"
              @click="showAttendees = !showAttendees"
            >
              {{ showAttendees ? 'Hide who\'s going' : 'See who\'s going' }}
              <i class="bi" :class="showAttendees ? 'bi-chevron-up' : 'bi-arrow-right'"></i>
            </button>

            <ul v-if="showAttendees" class="attendees">
              <li v-for="f in event.friends" :key="f.id">
                <ArtistAvatar :name="f.name" :hue="f.hue" :size="30" /> {{ f.name }}
                <span class="attendees__tag">Friend</span>
              </li>
              <li v-if="otherAttendees" class="attendees__more">and {{ otherAttendees }} other{{ otherAttendees === 1 ? '' : 's' }}</li>
            </ul>
          </section>

          <section class="lrm-card event-section">
            <div class="side-head">
              <h2 class="event-section__title m-0">More at {{ event.venue.fullName }}</h2>
              <span class="side-head__icon tone-violet"><i class="bi bi-megaphone-fill"></i></span>
            </div>

            <ul v-if="moreAtVenue.length" class="more-list">
              <li v-for="m in moreAtVenue" :key="m.id">
                <RouterLink :to="{ name: 'event-detail', params: { id: m.id } }" class="more-item">
                  <span class="more-item__thumb"><EventCover :palette="m.palette" :seed="m.id" /></span>
                  <span>
                    <small>{{ dayLabel(m.startsAt) }}</small>
                    <strong>{{ m.title === `${m.headliner.name} at ${m.venue.listName}` ? m.headliner.name : m.title }}</strong>
                  </span>
                </RouterLink>
              </li>
            </ul>
            <p v-else class="text-secondary small mt-3 mb-0">Nothing else scheduled here yet.</p>

            <RouterLink
              :to="{ name: 'events-list', query: { venue: event.venueId } }"
              class="more-all"
            >
              See all events at {{ event.venue.name }} <i class="bi bi-arrow-right"></i>
            </RouterLink>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.event-page {
  padding-top: 1.25rem;
  padding-bottom: 3rem;
  padding-inline: clamp(1rem, 4vw, 80px); /* full width, with the same side margins as the rest of the site */
}
.event-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

/* ---- hero ---- */
.hero {
  position: relative;
  min-height: 290px;
  border-radius: 20px;
  overflow: hidden;
  color: #fff;
  background: var(--lrm-raw-07122e);
}
.hero__cover {
  --crowd-max: 150px;
  position: absolute;
  inset: 0;
}
.hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(var(--lrm-raw-rgb-050a1e),  0.45) 0%, rgba(var(--lrm-raw-rgb-050a1e),  0) 38%, rgba(var(--lrm-raw-rgb-050a1e),  0.35) 100%);
}
.hero__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2.5rem;
  min-height: 290px;
  padding: 1.25rem 1.5rem 1.5rem;
}
.hero__back {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 6px rgba(var(--lrm-raw-rgb-000000),  0.4);
}
.hero__back:hover {
  text-decoration: underline;
}
.hero__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}
.hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.7rem;
}
.hero__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.95rem;
  border-radius: 999px;
  background: rgba(var(--lrm-raw-rgb-080e24),  0.62);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.hero__chip--genre {
  background: rgba(var(--lrm-raw-rgb-093c34),  0.7);
  border-color: color-mix(in srgb, var(--genre) 70%, transparent);
}
.hero__chip .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--genre);
  box-shadow: 0 0 8px var(--genre);
}
.hero__title {
  margin: 0;
  color: #fff;
  font-size: clamp(1.7rem, 3.2vw, 2.5rem);
  line-height: 1.12;
}
.hero__text {
  flex: 1 1 420px;
  min-width: 0;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}
.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(var(--lrm-raw-rgb-080e24),  0.45);
  backdrop-filter: blur(4px);
  color: #fff;
  font-weight: 700;
}
.hero__btn:hover {
  background: rgba(var(--lrm-raw-rgb-080e24),  0.7);
  color: #fff;
}
.hero__btn--primary {
  background: var(--lrm-brand);
  border-color: transparent;
}
.hero__btn--primary:hover {
  background: var(--lrm-brand-hover);
}

/* ---- tabs ---- */
.event-tabs {
  display: flex;
  gap: 2rem;
  margin: 1.2rem 0 1.1rem 0.5rem;
  border-bottom: 1px solid var(--lrm-border);
}
.event-tabs__tab {
  position: relative;
  padding: 0.6rem 0.2rem 0.8rem;
  border: 0;
  background: none;
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--lrm-muted);
}
.event-tabs__tab.is-active {
  color: var(--lrm-ink);
  font-weight: 800;
}
.event-tabs__tab.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  border-radius: 3px;
  background: var(--lrm-blue);
}

/* ---- layout ---- */
.event-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}
.event-layout__side {
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 992px) {
  .event-layout {
    grid-template-columns: minmax(0, 1fr) 360px;
  }
}

.event-section {
  padding: 1.4rem 1.5rem;
}
.event-section__title {
  margin: 0 0 0.6rem;
  font-size: 1.15rem;
}
.event-about {
  margin: 0;
  max-width: 68ch;
  color: var(--lrm-muted);
  line-height: 1.6;
}

/* ---- line-up ---- */
.lineup {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.75rem 1rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
}
.lineup__link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--lrm-ink);
  text-decoration: none;
}
.lineup__link:hover strong {
  text-decoration: underline;
}
.lineup__link > span:last-child {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}
.lineup__role {
  padding: 0.12rem 0.65rem;
  border-radius: 999px;
  background: var(--lrm-accent-tint);
  color: var(--lrm-raw-6a4fd6);
  font-size: 0.78rem;
  font-weight: 600;
}
.lineup__role.is-headliner {
  background: var(--lrm-raw-dfeaff);
  color: var(--lrm-accent);
}

/* ---- detail tiles ---- */
.tiles {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}
@media (min-width: 768px) {
  .tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.tile {
  display: flex;
  gap: 0.85rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--lrm-border);
  border-radius: 12px;
  background: #fff;
}
.tile__icon,
.side-head__icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  font-size: 1.15rem;
}
.tile__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.tile__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--lrm-muted);
}
.tile__value {
  font-weight: 600;
  color: var(--lrm-ink);
  overflow-wrap: anywhere;
}
.tile__link {
  align-self: flex-start;
  font-size: 0.88rem;
  font-weight: 500;
}

.tone-rose {
  background: var(--lrm-raw-ffe6ee);
  color: var(--lrm-raw-ee3d70);
}
.tone-amber {
  background: var(--lrm-raw-fff1d6);
  color: var(--lrm-raw-f29a0d);
}
.tone-violet {
  background: var(--lrm-raw-efe5ff);
  color: var(--lrm-raw-7b3fe0);
}
.tone-blue {
  background: var(--lrm-raw-e1ecff);
  color: var(--lrm-raw-2f6fe5);
}
.tone-green {
  background: var(--lrm-raw-d9f6ec);
  color: var(--lrm-raw-11a37f);
}
.tone-orange {
  background: var(--lrm-raw-ffeadb);
  color: var(--lrm-raw-f2791d);
}

/* ---- sidebar cards ---- */
.side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.going-stats {
  display: flex;
  gap: 1.6rem;
  margin: 1.1rem 0 0.9rem;
}
.going-stats > div {
  display: flex;
  flex-direction: column;
}
.going-stats > div + div {
  padding-left: 1.6rem;
  border-left: 1px solid var(--lrm-border);
}
.going-stats strong {
  font-size: 2rem;
  line-height: 1;
  color: var(--lrm-ink);
}
.going-stats span {
  font-size: 0.88rem;
  color: var(--lrm-muted);
}
.going-friends {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0 0 1rem;
  font-size: 0.88rem;
  color: var(--lrm-muted);
}
.going-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.7rem;
  border: 0;
  border-radius: 10px;
  background: var(--lrm-soft);
  font-weight: 700;
  color: var(--lrm-ink);
}
.going-btn:hover {
  background: var(--lrm-divider);
}
.attendees {
  list-style: none;
  margin: 0.9rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
  font-weight: 600;
  color: var(--lrm-ink);
}
.attendees li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.attendees__tag {
  margin-left: auto;
  padding: 0.05rem 0.55rem;
  border-radius: 999px;
  background: var(--lrm-raw-e1f7ee);
  color: var(--lrm-raw-11956f);
  font-size: 0.74rem;
}
.attendees__more {
  color: var(--lrm-muted) !important;
  font-weight: 500 !important;
}

.more-list {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
}
.more-list li + li {
  border-top: 1px solid var(--lrm-border);
}
.more-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem 0;
  color: var(--lrm-ink);
  text-decoration: none;
}
.more-item:hover strong {
  text-decoration: underline;
}
.more-item > span:last-child {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.more-item small {
  color: var(--lrm-muted);
  font-size: 0.82rem;
}
.more-item__thumb {
  flex: none;
  width: 62px;
  height: 46px;
  border-radius: 8px;
  overflow: hidden;
}
.more-item__thumb :deep(.event-cover) {
  width: 100%;
  height: 100%;
}
.more-all {
  display: inline-block;
  margin-top: 0.7rem;
  font-weight: 600;
  font-size: 0.92rem;
}
</style>

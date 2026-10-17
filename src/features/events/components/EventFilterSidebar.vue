<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import RangeSlider from './RangeSlider.vue'
import ArtistAvatar from './ArtistAvatar.vue'
import { useEventFilters, MAX_DISTANCE_KM, WEEK_DAYS } from '../composables/useEventFilters'
import { toast } from '@/composables/useToast'
import { requireLogin } from '@/lib/session'

const emit = defineEmits(['applied'])

const filters = useEventFilters()
const searchInput = ref(null)

function clearSearch() {
  filters.setQuery('')
  searchInput.value?.focus()
}
const { draft, genres, artists, genreCounts, days } = filters

// ---- artists list -----------------------------------------------------------
const COLLAPSED_ARTISTS = 2
const showAllArtists = ref(false)
const visibleArtists = computed(() =>
  showAllArtists.value ? artists.value : artists.value.slice(0, COLLAPSED_ARTISTS),
)
const hiddenArtistCount = computed(() => Math.max(0, artists.value.length - COLLAPSED_ARTISTS))

// ---- sliders ------------------------------------------------------------------
const distanceLabel = computed(() =>
  draft.distance >= MAX_DISTANCE_KM ? `${MAX_DISTANCE_KM}+ km` : `Within ${draft.distance} km`,
)
const distanceTicks = [
  { value: 0, top: '0' },
  { value: 5, top: '5' },
  { value: 10, top: '10' },
  { value: 15, top: '15' },
  { value: MAX_DISTANCE_KM, top: '20+ km' },
]
const dateTicks = computed(() => days.value.map((d) => ({ value: d.index, top: d.dow, bottom: d.num })))

// ---- voice search (Web Speech API, where available) ------------------------------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const listening = ref(false)
let recognition = null

function toggleVoice() {
  if (!SpeechRecognition) {
    toast('Voice search is not supported in this browser')
    return
  }
  if (listening.value) {
    recognition?.stop()
    return
  }
  recognition = new SpeechRecognition()
  recognition.lang = 'en-SG'
  recognition.interimResults = false
  recognition.onresult = (e) => filters.setQuery(e.results[0][0].transcript)
  recognition.onerror = () => toast('Could not hear that, try again')
  recognition.onend = () => (listening.value = false)
  listening.value = true
  recognition.start()
}
onBeforeUnmount(() => recognition?.abort())

// a short burst of music notes from the heart when preferences are saved
const heartBurst = ref(false)
let burstTimer = null

function onHeartClick() {
  // saving preferences belongs to your account
  requireLogin(() => {
    if (filters.canSavePreferences.value) {
      filters.savePreferences()
      toast('Preferences saved')
      heartBurst.value = true
      clearTimeout(burstTimer)
      burstTimer = setTimeout(() => (heartBurst.value = false), 1900)
    } else if (filters.preferencesOn.value) {
      toast('These are already your saved preferences')
    } else {
      toast('Choose some filters first, then tap the heart to save them')
    }
  })
}

function apply() {
  filters.apply()
  emit('applied')
}

</script>

<template>
  <aside class="filters lrm-card" aria-label="Event filters">
    <!-- Search -->
    <div class="filters__search">
      <i class="bi bi-search" aria-hidden="true"></i>
      <input
        ref="searchInput"
        :value="draft.q"
        type="search"
        placeholder="Search"
        aria-label="Search events, artists or venues"
        @input="filters.setQuery($event.target.value)"
      />
      <button
        v-if="draft.q"
        type="button"
        class="filters__clear"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <i class="bi bi-x-lg"></i>
      </button>
      <button
        type="button"
        class="filters__mic"
        :class="{ 'is-listening': listening }"
        :aria-label="listening ? 'Stop voice search' : 'Search by voice'"
        :aria-pressed="listening"
        @click="toggleVoice"
      >
        <i class="bi bi-mic-fill"></i>
      </button>
    </div>

    <!-- Preferences -->
    <div class="filters__row filters__prefs">
      <div class="d-flex align-items-center gap-2">
        <button
          type="button"
          class="filters__heart"
          :class="{
            'is-saved': filters.preferencesOn.value,
            'can-save': filters.canSavePreferences.value,
            'is-beating': heartBurst,
          }"
          aria-label="Save these filters as my preferences"
          title="Save these filters as your preferences"
          @click="onHeartClick"
        >
          <i class="bi" :class="filters.preferencesOn.value ? 'bi-heart-fill' : 'bi-heart'"></i>
          <template v-if="heartBurst">
            <i class="bi bi-music-note-beamed filters__note filters__note--1" aria-hidden="true"></i>
            <i class="bi bi-music-note filters__note filters__note--2" aria-hidden="true"></i>
            <i class="bi bi-music-note-beamed filters__note filters__note--3" aria-hidden="true"></i>
            <i class="bi bi-music-note filters__note filters__note--4" aria-hidden="true"></i>
            <i class="bi bi-music-note-beamed filters__note filters__note--5" aria-hidden="true"></i>
            <span class="filters__ring" aria-hidden="true"></span>
          </template>
        </button>
        <span class="filters__prefs-label">Your Preferences</span>
      </div>
      <div class="form-check form-switch m-0">
        <input
          id="pref-toggle"
          v-model="filters.preferencesOn.value"
          class="form-check-input"
          type="checkbox"
          role="switch"
          aria-label="Use my saved preferences"
          :disabled="!filters.hasPreferences.value"
          :title="filters.hasPreferences.value ? '' : 'Choose some filters and tap the heart to save them first'"
        />
      </div>
    </div>

    <!-- Genre -->
    <section class="filters__group">
      <h2 class="filters__heading">Genre</h2>
      <label v-for="g in genres" :key="g.id" class="filters__option">
        <input
          class="form-check-input"
          type="checkbox"
          :checked="draft.genres.includes(g.id)"
          @change="filters.toggleGenre(g.id)"
        />
        <span class="filters__option-label">{{ g.label }}</span>
        <span class="filters__count">{{ genreCounts[g.id] || 0 }}</span>
      </label>
    </section>

    <!-- Artists -->
    <section class="filters__group">
      <h2 class="filters__heading">Artists</h2>
      <label v-for="a in visibleArtists" :key="a.id" class="filters__option">
        <input
          class="form-check-input"
          type="checkbox"
          :checked="draft.artists.includes(a.id)"
          @change="filters.toggleArtist(a.id)"
        />
        <ArtistAvatar :name="a.name" :hue="a.hue" :size="24" />
        <span class="filters__option-label">{{ a.name }}</span>
        <span class="filters__count">{{ a.eventCount }}</span>
      </label>
      <button
        v-if="hiddenArtistCount"
        type="button"
        class="filters__more"
        :aria-expanded="showAllArtists"
        @click="showAllArtists = !showAllArtists"
      >
        <template v-if="showAllArtists">− Show fewer artists</template>
        <template v-else>+ Show more artists</template>
      </button>
    </section>

    <!-- Distance -->
    <section class="filters__group">
      <div class="filters__slider-head">
        <h2 class="filters__heading">Distance</h2>
        <strong>{{ distanceLabel }}</strong>
      </div>
      <RangeSlider
        v-model="draft.distance"
        :min="0"
        :max="MAX_DISTANCE_KM"
        :ticks="distanceTicks"
        label="Maximum distance in kilometres"
        :value-text="distanceLabel"
      />
    </section>

    <!-- Date -->
    <section class="filters__group">
      <div class="filters__slider-head">
        <h2 class="filters__heading">Date</h2>
        <strong>{{ filters.dayRangeLabel(draft.day) }}</strong>
      </div>
      <RangeSlider
        v-model="draft.day"
        :min="0"
        :max="WEEK_DAYS - 1"
        :ticks="dateTicks"
        label="Show events up to"
        :value-text="filters.dayRangeLabel(draft.day)"
      />
    </section>

    <!-- Stays at the bottom of the sidebar so Apply never needs scrolling -->
    <div class="filters__footer">
      <button type="button" class="btn btn-lrm filters__apply" :class="{ 'is-dirty': filters.isDirty.value }" @click="apply">
        <span v-if="filters.isDirty.value" class="filters__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        {{ filters.isDirty.value ? 'Apply changes' : 'Apply filters' }}
      </button>
      <button type="button" class="filters__reset" @click="filters.reset()">Reset filters</button>
    </div>
  </aside>
</template>

<style scoped>
/* sizes from Figma "📸 13 Events (Map) Filtered" → filter-panel: 15px padding, 12px labels, 11px headings */
.filters {
  padding: 15px;
}
.filters.lrm-card {
  border-color: var(--lrm-line);
  border-radius: var(--lrm-radius-card);
  box-shadow: none;
}

.filters__search {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 4px 6px 4px 14px;
  border-radius: 999px;
  background: var(--lrm-soft);
  color: var(--lrm-muted);
}
.filters__search input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: var(--lrm-ink);
  padding: 6px 0;
}
.filters__search input::placeholder {
  color: var(--lrm-muted);
}
.filters__search:focus-within {
  box-shadow: 0 0 0 2px var(--lrm-blue);
}
.filters__search input::-webkit-search-cancel-button {
  -webkit-appearance: none; /* the browser's own cross is replaced by the button below */
  appearance: none;
  display: none;
}
.filters__clear {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--lrm-muted);
  font-size: 0.8rem;
  transition: background 0.15s, color 0.15s, transform 0.15s;
}
.filters__clear:hover {
  background: var(--lrm-raw-fee2e2);
  color: var(--lrm-raw-dc2626);
}
.filters__clear:active {
  transform: scale(0.92);
}
.filters__mic {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--lrm-muted);
}
.filters__mic:hover {
  background: var(--lrm-raw-e0e4f3);
}
.filters__mic.is-listening {
  background: var(--lrm-coral);
  color: #fff;
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  50% {
    box-shadow: 0 0 0 8px rgba(var(--lrm-raw-rgb-f0483e),  0.15);
  }
}

.filters__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.filters__prefs-label {
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
}
.filters__prefs {
  margin: 12px 0 0;
  padding: 10px 0;
  border-top: 1px solid var(--lrm-border);
  border-bottom: 1px solid var(--lrm-border);
  font-weight: 700;
  color: var(--lrm-ink);
}
.filters__prefs .form-check-input {
  width: 3.1em;
  height: 1.65em;
  margin: 0;
  cursor: pointer;
  border: 2px solid var(--lrm-raw-8f9ab8);
  background-color: var(--lrm-raw-e9edf8);
  /* a dark knob so the switch is easy to see when it is off */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%236b7694'/%3e%3c/svg%3e");
  transition: background-color 0.2s, border-color 0.2s, background-position 0.2s;
}
.filters__prefs .form-check-input:checked {
  background-color: var(--lrm-blue);
  border-color: var(--lrm-blue);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
  box-shadow: 0 2px 8px color-mix(in srgb, var(--lrm-accent) 40%, transparent);
}
.filters__prefs .form-check-input:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lrm-accent) 25%, transparent);
}
.filters__prefs .form-check-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* the heart: grey when there is nothing to save, red outline when the current
   filters can be saved, filled red when they are the saved preferences */
.filters__heart {
  position: relative;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  margin-left: -0.3rem;
  flex-shrink: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--lrm-faint);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.filters__heart:hover {
  background: var(--lrm-raw-fee2e2);
  color: var(--lrm-raw-dc2626);
}
.filters__heart.can-save {
  color: var(--lrm-raw-dc2626);
  cursor: pointer;
}
.filters__heart.can-save:hover {
  background: var(--lrm-raw-fee2e2);
}
.filters__heart.is-saved {
  color: var(--lrm-raw-dc2626);
}

/* on save: the heart gives a strong beat, a ring spreads out, and music notes float up from it */
.filters__heart.is-beating > .bi:first-child {
  animation: heart-beat 0.7s ease-out;
}
@keyframes heart-beat {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.8);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
.filters__ring {
  position: absolute;
  inset: 0;
  border: 2px solid var(--lrm-raw-ef4444);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  animation: heart-ring 0.9s ease-out;
}
@keyframes heart-ring {
  0% {
    opacity: 0.9;
    transform: scale(0.6);
  }
  100% {
    opacity: 0;
    transform: scale(2.6);
  }
}
.filters__note {
  position: absolute;
  left: 50%;
  top: 50%;
  margin: -0.6rem 0 0 -0.45rem;
  font-size: 1.15rem;
  font-weight: 700;
  opacity: 0;
  pointer-events: none;
  z-index: 2;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  animation: note-fall 1.5s cubic-bezier(0.3, 0.1, 0.5, 1) forwards;
  animation-delay: var(--delay, 0s);
}
/* each note: --dx how far it drifts sideways, --up how high it pops out of the heart, --spin its tilt */
.filters__note--1 {
  color: var(--lrm-raw-ff4d8d);
  --dx: -20px;
  --up: -26px;
  --spin: -40deg;
}
.filters__note--2 {
  color: var(--lrm-raw-7c4dff);
  --dx: 30px;
  --up: -34px;
  --spin: 35deg;
  --delay: 0.07s;
}
.filters__note--3 {
  color: var(--lrm-raw-ef4444);
  --dx: -14px;
  --up: -38px;
  --spin: 25deg;
  --delay: 0.14s;
}
.filters__note--4 {
  color: var(--lrm-blue);
  --dx: 52px;
  --up: -22px;
  --spin: 60deg;
  --delay: 0.21s;
}
.filters__note--5 {
  color: var(--lrm-raw-ff4d8d);
  --dx: 10px;
  --up: -30px;
  --spin: -30deg;
  --delay: 0.28s;
}
/* the note pops out of the heart, arcs up and sideways, then falls away with a spin */
@keyframes note-fall {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.3) rotate(0deg);
  }
  15% {
    opacity: 1;
    transform: translate(calc(var(--dx) * 0.3), calc(var(--up) * 0.8)) scale(1.2) rotate(calc(var(--spin) * 0.3));
  }
  35% {
    opacity: 1;
    transform: translate(calc(var(--dx) * 0.6), var(--up)) scale(1.1) rotate(calc(var(--spin) * 0.6));
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx), 70px) scale(0.8) rotate(var(--spin));
  }
}

.filters__group {
  padding: 13px 0 12px;
}
.filters__group + .filters__group {
  border-top: 1px solid var(--lrm-border);
}
.filters__heading {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--lrm-subtle);
}

.filters__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 400;
  color: var(--lrm-ink);
}
.filters__option .form-check-input {
  flex: none;
  margin: 0;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  cursor: pointer;
}
.filters__chip {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 5px;
}
.filters__option-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.filters__count {
  font-size: 11px;
  color: var(--lrm-subtle);
}

.filters__more {
  margin-top: 0.3rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--lrm-brand);
  font-size: 12px;
  font-weight: 500;
}
.filters__more:hover {
  text-decoration: underline;
}

.filters__slider-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.filters__slider-head strong {
  font-size: 11px;
  font-weight: 500;
  color: var(--lrm-ink);
}

.filters__footer {
  position: sticky;
  bottom: -0.75rem; /* flush with the bottom of the card, so nothing shows underneath */
  z-index: 5;
  margin: auto -1rem -0.75rem; /* when the sidebar is taller than its content, Apply sits at the bottom */
  padding: 0.5rem 1rem 0.45rem;
  background: #fff;
  border-top: 1px solid var(--lrm-border);
  border-radius: 0 0 var(--lrm-radius) var(--lrm-radius);
  box-shadow: 0 -8px 16px rgba(var(--lrm-raw-rgb-14235a),  0.05);
}
.filters__apply {
  position: relative;
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: 25px;
  background: var(--lrm-accent); /* Figma: the blue action colour; here the theme's accent */
  color: var(--lrm-on-accent);
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}
/* Unapplied changes: the button lights up electric blue, with a little music equalizer */
.filters__apply.is-dirty {
  background: linear-gradient(135deg, var(--lrm-raw-1b3fbf) 0%, var(--lrm-raw-2f7bff) 60%, var(--lrm-raw-22c1e8) 100%);
  animation: apply-pulse 1.6s ease-in-out infinite;
}
.filters__apply.is-dirty:hover {
  background: linear-gradient(135deg, var(--lrm-raw-1535a8) 0%, var(--lrm-raw-2a6cf0) 60%, var(--lrm-raw-14b3dc) 100%);
  transform: translateY(-1px);
}
.filters__apply:active {
  transform: translateY(1px) scale(0.99);
}
@keyframes apply-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--lrm-accent) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--lrm-accent) 0%, transparent);
  }
}

.filters__eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  margin-right: 0.5rem;
  vertical-align: -2px;
}
.filters__eq i {
  display: block;
  width: 3px;
  height: 100%;
  border-radius: 2px;
  background: #fff;
  transform-origin: bottom;
  animation: eq-bounce 0.9s ease-in-out infinite;
}
.filters__eq i:nth-child(2) {
  animation-delay: -0.3s;
}
.filters__eq i:nth-child(3) {
  animation-delay: -0.6s;
}
.filters__eq i:nth-child(4) {
  animation-delay: -0.15s;
}
@keyframes eq-bounce {
  0%,
  100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.filters__reset {
  display: block;
  margin: 0.15rem auto 0;
  padding: 0.15rem 0.7rem;
  border: 0;
  background: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--lrm-raw-dc2626); /* standard destructive red */
  transition: color 0.15s;
}
.filters__reset:hover {
  color: var(--lrm-raw-b91c1c);
  text-decoration: underline;
}

/* short browser windows: squeeze a bit more so the whole panel is visible */
@media (max-height: 820px) {
  .filters__option {
    padding: 0.03rem 0;
  }
  .filters__group {
    padding-top: 0.35rem;
  }
  .filters__prefs {
    padding: 0.25rem 0;
  }
}
</style>

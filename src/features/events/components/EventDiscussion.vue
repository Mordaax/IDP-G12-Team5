<script setup>
import { onMounted, ref } from 'vue'
import ArtistAvatar from './ArtistAvatar.vue'
import { fetchDiscussion } from '../services/eventsService'
import { useCurrentUser } from '@/composables/useCurrentUser'

// Lightweight event discussion (comments + upvotes), held in memory for now.
// The forum feature owns the real threads; this just makes the tab useful.
defineProps({ eventId: { type: String, required: true } })

const { user } = useCurrentUser()
const comments = ref([])
const draft = ref('')
const voted = ref(new Set())
const loading = ref(true)

onMounted(async () => {
  comments.value = await fetchDiscussion()
  loading.value = false
})

function ago(minutes) {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.round(minutes / 60)}h ago`
}

function post() {
  const text = draft.value.trim()
  if (!text) return
  comments.value.push({
    id: `local-${Date.now()}`,
    author: user.value.name,
    hue: 330,
    minutesAgo: 0,
    text,
    votes: 0,
    mine: true,
  })
  draft.value = ''
}

function vote(c) {
  const next = new Set(voted.value)
  if (next.has(c.id)) {
    next.delete(c.id)
    c.votes -= 1
  } else {
    next.add(c.id)
    c.votes += 1
  }
  voted.value = next
}
</script>

<template>
  <section class="discussion lrm-card">
    <h2 class="discussion__title">Discussion · {{ comments.length }} comment{{ comments.length === 1 ? '' : 's' }}</h2>

    <form class="discussion__form" @submit.prevent="post">
      <ArtistAvatar :name="user.name" :hue="340" :size="40" />
      <input v-model="draft" type="text" class="form-control" placeholder="Join the conversation…" aria-label="Write a comment" />
      <button type="submit" class="btn btn-dark rounded-pill px-4" :disabled="!draft.trim()">Comment</button>
    </form>

    <div v-if="loading" class="text-center py-4"><div class="spinner-border spinner-border-sm" role="status"></div></div>

    <ul v-else class="discussion__list">
      <li v-for="c in comments" :key="c.id" class="discussion__item">
        <ArtistAvatar :name="c.author" :hue="c.hue" :size="40" />
        <div class="flex-grow-1">
          <p class="discussion__meta"><strong>{{ c.author }}</strong> · {{ ago(c.minutesAgo) }}</p>
          <p class="discussion__text">{{ c.text }}</p>
          <button
            type="button"
            class="discussion__vote"
            :class="{ 'is-voted': voted.has(c.id) }"
            :aria-pressed="voted.has(c.id)"
            @click="vote(c)"
          >
            <i class="bi bi-arrow-up"></i> {{ c.votes }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.discussion {
  padding: 1.4rem 1.5rem;
}
.discussion__title {
  font-size: 1.15rem;
  margin-bottom: 1rem;
}
.discussion__form {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.4rem;
}
.discussion__form .form-control {
  border-radius: 999px;
  padding: 0.65rem 1.1rem;
}
.discussion__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.1rem;
}
.discussion__item {
  display: flex;
  gap: 0.85rem;
}
.discussion__meta {
  margin: 0;
  font-size: 0.85rem;
  color: var(--lrm-muted);
}
.discussion__meta strong {
  color: var(--lrm-ink);
}
.discussion__text {
  margin: 0.15rem 0 0.3rem;
  color: var(--lrm-text);
}
.discussion__vote {
  padding: 0.1rem 0.5rem 0.1rem 0;
  border: 0;
  background: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--lrm-muted);
}
.discussion__vote.is-voted {
  color: var(--lrm-coral);
}
</style>

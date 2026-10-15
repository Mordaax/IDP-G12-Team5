import { ref } from 'vue'

// Events the user has hearted / saved. Persisted locally for now; swap the
// persistence for an API call when the backend exists.
const STORAGE_KEY = 'lrm.savedEvents'

function read() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

const saved = ref(read())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved.value]))
  } catch {
    /* private mode / quota: keep the in-memory copy */
  }
}

export function useSavedEvents() {
  const isSaved = (id) => saved.value.has(id)

  /** Returns the new saved state. */
  function toggle(id) {
    const next = new Set(saved.value)
    const nowSaved = !next.delete(id)
    if (nowSaved) next.add(id)
    saved.value = next
    persist()
    return nowSaved
  }

  return { isSaved, toggle }
}

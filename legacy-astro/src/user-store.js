import { defineStore } from 'pinia'
import { ref } from 'vue'

// Logged-in user. Mock data for now; will come from the backend later.
export const useUserStore = defineStore('user', () => {
  // state
  const user = ref({
    id: 'kit-tan',
    name: 'Kit Tan',
    initials: 'KT',
    preferredGenreIds: ['pop', 'mandopop', 'electronic'],
    location: { lat: 1.295, lng: 103.849, label: 'Bras Basah' },
  })

  return { user }
})

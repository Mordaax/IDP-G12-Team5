import { computed, ref } from 'vue'
import { USER } from '@/data'

// The signed-in user is always Kit Tan (src/data/db.json → "user"). Replace with a real
// auth/profile store once the backend lands; everything reads it through this composable.
const user = ref({ ...USER })

export function useCurrentUser() {
  return {
    user,
    firstName: computed(() => user.value.firstName),
  }
}

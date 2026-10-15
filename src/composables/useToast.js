import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'

// The events pages call toast('…'). The message itself is kept in the app's toast
// store, which is what <ToastHost /> in App.vue displays.
export function toast(text) {
  useToastStore().show(text)
}

export function useToast() {
  const store = useToastStore()
  return { message: computed(() => store.message), toast }
}

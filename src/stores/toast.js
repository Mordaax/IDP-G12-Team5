import { defineStore } from 'pinia'
import { ref } from 'vue'

// Small message shown at the bottom of the page (see ToastHost.vue).
export const useToastStore = defineStore('toast', () => {
  // state
  const message = ref('')
  let timer = null

  // actions
  function show(text) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = ''
    }, 2500)
  }

  return { message, show }
})

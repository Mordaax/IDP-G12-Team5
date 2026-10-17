<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <Transition name="toast">
    <div v-if="toastStore.message" class="lrm-toast" role="status" aria-live="polite">{{ toastStore.message }}</div>
  </Transition>
</template>

<style scoped>
.lrm-toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 2000;
  max-width: calc(100vw - 32px);
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  background: var(--lrm-navy);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 10px 30px rgba(var(--lrm-raw-rgb-0c1e4a),  0.3);
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>

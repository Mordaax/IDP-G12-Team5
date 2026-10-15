<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// A small custom dropdown for choosing how events are sorted.
const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true }, // [{ value, label, icon }]
  prefix: { type: String, default: 'Sort by' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const root = ref(null)

const current = () => props.options.find((o) => o.value === props.modelValue) || props.options[0]

function choose(option) {
  emit('update:modelValue', option.value)
  open.value = false
}

function closeOnOutsideClick(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
function closeOnEscape(e) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
  document.addEventListener('keydown', closeOnEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  document.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div ref="root" class="sort-dropdown">
    <button
      type="button"
      class="sort-dropdown__button"
      :class="{ 'is-open': open }"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="sort-dropdown__badge" aria-hidden="true">
        <span class="eq" :class="{ 'is-playing': open }"><i></i><i></i><i></i><i></i></span>
      </span>
      <span class="sort-dropdown__prefix">{{ prefix }}</span>
      <!-- every label sits in the same spot (only the chosen one is visible),
           so the button is always as wide as the longest option and never resizes -->
      <span class="sort-dropdown__labels">
        <strong
          v-for="option in options"
          :key="option.value"
          :class="{ 'is-hidden': option.value !== modelValue }"
        >
          {{ option.label }}
        </strong>
      </span>
      <i class="bi bi-chevron-down sort-dropdown__chevron"></i>
    </button>

    <Transition name="sort-menu">
      <ul v-if="open" class="sort-dropdown__menu" role="listbox">
        <li v-for="option in options" :key="option.value" role="option" :aria-selected="option.value === modelValue">
          <button
            type="button"
            class="sort-dropdown__option"
            :class="{ 'is-selected': option.value === modelValue }"
            @click="choose(option)"
          >
            <i class="bi" :class="option.icon"></i>
            <span>{{ option.label }}</span>
            <span v-if="option.value === modelValue" class="eq is-playing sort-dropdown__check" aria-hidden="true">
              <i></i><i></i><i></i><i></i>
            </span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.sort-dropdown {
  position: relative;
  display: inline-block;
}
@media (max-width: 575.98px) {
  .sort-dropdown__prefix {
    display: none;
  }
}

.sort-dropdown__button {
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem 0.5rem 0.8rem;
  border: 1px solid var(--lrm-border);
  border-radius: 999px;
  background: #fff;
  color: var(--lrm-ink);
  font-size: 0.92rem;
  box-shadow: var(--lrm-shadow-sm);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.sort-dropdown__button:hover {
  border-color: #c9d3ee;
  transform: translateY(-1px);
}
.sort-dropdown__button.is-open {
  border-color: var(--lrm-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.sort-dropdown__badge {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin: -0.15rem 0.1rem -0.15rem -0.45rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d8d 0%, #7c4dff 100%); /* same colours as the LittleRedMusic logo */
  box-shadow: 0 2px 6px rgba(124, 77, 255, 0.4);
}

/* little music equalizer: the bars dance while the menu is open */
.eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.eq i {
  display: block;
  width: 3px;
  height: 100%;
  border-radius: 2px;
  background: #fff;
  transform: scaleY(0.4);
  transform-origin: bottom;
}
.eq i:nth-child(2) {
  height: 70%;
}
.eq i:nth-child(3) {
  height: 90%;
}
.eq.is-playing i,
.sort-dropdown__button:hover .eq i {
  animation: eq-dance 0.9s ease-in-out infinite;
}
.eq.is-playing i:nth-child(2),
.sort-dropdown__button:hover .eq i:nth-child(2) {
  animation-delay: -0.3s;
}
.eq.is-playing i:nth-child(3),
.sort-dropdown__button:hover .eq i:nth-child(3) {
  animation-delay: -0.6s;
}
.eq.is-playing i:nth-child(4),
.sort-dropdown__button:hover .eq i:nth-child(4) {
  animation-delay: -0.15s;
}
@keyframes eq-dance {
  0%,
  100% {
    transform: scaleY(0.35);
  }
  50% {
    transform: scaleY(1);
  }
}

.sort-dropdown__labels {
  display: inline-grid;
  text-align: left;
}
.sort-dropdown__labels > strong {
  grid-area: 1 / 1;
}
.sort-dropdown__labels > .is-hidden {
  visibility: hidden;
}
.sort-dropdown__prefix {
  color: var(--lrm-muted);
}
.sort-dropdown__chevron {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--lrm-muted);
  transition: transform 0.2s;
}
.sort-dropdown__button.is-open .sort-dropdown__chevron {
  transform: rotate(180deg);
}

.sort-dropdown__menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0; /* same width and position as the button */
  z-index: 30;
  margin: 0;
  padding: 0.4rem;
  list-style: none;
  border: 1px solid var(--lrm-border);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 14px 34px rgba(20, 35, 90, 0.16);
}
.sort-dropdown__option {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 0;
  border-radius: 10px;
  background: none;
  color: var(--lrm-text);
  font-size: 0.92rem;
  font-weight: 600;
  text-align: left;
  transition: background 0.12s;
}
.sort-dropdown__option:hover {
  background: #f1f4fd;
}
.sort-dropdown__option .bi:first-child {
  width: 1.1rem;
  color: var(--lrm-muted);
}
.sort-dropdown__option.is-selected {
  background: #e9f0ff;
  color: var(--lrm-ink);
  font-weight: 800;
}
.sort-dropdown__option.is-selected .bi:first-child {
  color: var(--lrm-blue);
}
.sort-dropdown__check {
  margin-left: auto;
  height: 13px;
}
.sort-dropdown__check i {
  background: linear-gradient(180deg, #ff4d8d, #7c4dff);
}

.sort-menu-enter-active,
.sort-menu-leave-active {
  transition: opacity 0.15s, transform 0.15s;
  transform-origin: top center;
}
.sort-menu-enter-from,
.sort-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>

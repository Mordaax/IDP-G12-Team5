<script setup>
import { computed } from 'vue'

// Single-handle range with tick labels aligned to the thumb centre.
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, required: true },
  step: { type: Number, default: 1 },
  ticks: { type: Array, default: () => [] }, // [{ value, top, bottom? }]
  label: { type: String, required: true }, // accessible name
  valueText: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const ratio = computed(() => (props.modelValue - props.min) / (props.max - props.min))
const pos = (v) => `${((v - props.min) / (props.max - props.min)) * 100}%`
</script>

<template>
  <div class="range-slider">
    <input
      class="range-slider__input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :style="{ '--p': ratio }"
      :aria-label="label"
      :aria-valuetext="valueText || undefined"
      @input="emit('update:modelValue', Number($event.target.value))"
    />
    <div v-if="ticks.length" class="range-slider__ticks" aria-hidden="true">
      <span
        v-for="t in ticks"
        :key="t.value"
        class="range-slider__tick"
        :class="{ 'is-current': t.value === modelValue }"
        :style="{ left: pos(t.value) }"
      >
        {{ t.top }}<small v-if="t.bottom !== undefined">{{ t.bottom }}</small>
      </span>
    </div>
  </div>
</template>

<style scoped>
.range-slider {
  --thumb: 22px;
  --track: 6px;
}

.range-slider__input {
  display: block;
  width: 100%;
  height: var(--thumb);
  margin: 0;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.range-slider__input::-webkit-slider-runnable-track {
  height: var(--track);
  border-radius: var(--track);
  background: linear-gradient(
    to right,
    var(--lrm-blue) calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--p)),
    var(--lrm-line) 0
  );
}
.range-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: var(--thumb);
  height: var(--thumb);
  margin-top: calc((var(--track) - var(--thumb)) / 2);
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--lrm-blue);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--lrm-accent) 30%, transparent);
}
.range-slider__input::-moz-range-track {
  height: var(--track);
  border-radius: var(--track);
  background: var(--lrm-line);
}
.range-slider__input::-moz-range-progress {
  height: var(--track);
  border-radius: var(--track);
  background: var(--lrm-blue);
}
.range-slider__input::-moz-range-thumb {
  width: calc(var(--thumb) - 4px);
  height: calc(var(--thumb) - 4px);
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--lrm-blue);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--lrm-accent) 30%, transparent);
}

.range-slider__ticks {
  position: relative;
  height: 1.9rem;
  margin: 0.2rem calc(var(--thumb) / 2) 0;
}
.range-slider__tick {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.68rem;
  line-height: 1.25;
  color: var(--lrm-faint);
  white-space: nowrap;
}
.range-slider__tick small {
  font-size: 0.68rem;
}
.range-slider__tick.is-current {
  color: var(--lrm-ink);
  font-weight: 700;
}
</style>

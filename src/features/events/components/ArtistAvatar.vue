<script setup>
import { computed } from 'vue'

// Placeholder avatar: initials on a hue-derived gradient. Becomes an <img>
// automatically once an artist has an `image` URL.
const props = defineProps({
  name: { type: String, required: true },
  hue: { type: Number, default: 220 },
  image: { type: String, default: '' },
  size: { type: Number, default: 40 },
  ring: { type: Boolean, default: false },
})

const initials = computed(() =>
  props.name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join(''),
)

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.max(10, props.size * 0.36)}px`,
  background: props.image
    ? `center / cover url(${props.image})`
    : `linear-gradient(135deg, hsl(${props.hue} 70% 38%), hsl(${(props.hue + 40) % 360} 75% 22%))`,
}))
</script>

<template>
  <span class="artist-avatar" :class="{ 'artist-avatar--ring': ring }" :style="style" :title="name">
    <template v-if="!image">{{ initials }}</template>
  </span>
</template>

<style scoped>
.artist-avatar {
  flex: none;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
  user-select: none;
}
.artist-avatar--ring {
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--lrm-border);
}
</style>

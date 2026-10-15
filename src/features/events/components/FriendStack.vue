<script setup>
import ArtistAvatar from './ArtistAvatar.vue'

// Overlapping row of friend avatars (max 3 shown).
defineProps({
  friends: { type: Array, required: true },
  size: { type: Number, default: 30 },
})
</script>

<template>
  <span class="friend-stack">
    <ArtistAvatar
      v-for="f in friends.slice(0, 3)"
      :key="f.id"
      :name="f.name"
      :hue="f.hue"
      :size="size"
      ring
    />
  </span>
</template>

<style scoped>
.friend-stack {
  display: inline-flex;
}
.friend-stack > * + * {
  margin-left: -10px;
}
</style>

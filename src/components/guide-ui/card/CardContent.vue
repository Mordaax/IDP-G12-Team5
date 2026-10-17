<script setup>
import { cn } from "@/style-guide/utils";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <div data-slot="card-content" :class="cn('sgu:px-6', props.class)">
    <slot />
  </div>
</template>

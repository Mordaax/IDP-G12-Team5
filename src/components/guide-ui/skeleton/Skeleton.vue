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
  <div
    data-slot="skeleton"
    :class="cn('sgu:animate-pulse sgu:rounded-md sgu:bg-primary/10', props.class)"
  />
</template>

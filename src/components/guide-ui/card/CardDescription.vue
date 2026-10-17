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
  <p
    data-slot="card-description"
    :class="cn('sgu:text-muted-foreground sgu:text-sm', props.class)"
  >
    <slot />
  </p>
</template>

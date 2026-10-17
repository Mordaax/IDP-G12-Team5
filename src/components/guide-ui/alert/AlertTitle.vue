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
    data-slot="alert-title"
    :class="
      cn(
        'sgu:col-start-2 sgu:line-clamp-1 sgu:min-h-4 sgu:font-medium sgu:tracking-tight',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>

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
    data-slot="alert-description"
    :class="
      cn(
        'sgu:text-muted-foreground sgu:col-start-2 sgu:text-sm sgu:[&_p]:leading-relaxed',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>

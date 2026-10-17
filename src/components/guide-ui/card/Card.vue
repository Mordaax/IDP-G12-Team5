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
    data-slot="card"
    :class="
      cn(
        'sgu:bg-card sgu:text-card-foreground sgu:flex sgu:flex-col sgu:gap-6 sgu:rounded-xl sgu:border sgu:py-6 sgu:shadow-sm',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>

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
    data-slot="dialog-header"
    :class="cn('sgu:flex sgu:flex-col sgu:gap-2 sgu:text-center sgu:sm:text-left', props.class)"
  >
    <slot />
  </div>
</template>

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
    data-slot="card-footer"
    :class="cn('sgu:flex sgu:items-center sgu:px-6 sgu:[.border-t]:pt-6', props.class)"
  >
    <slot />
  </div>
</template>

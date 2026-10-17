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
    data-slot="card-header"
    :class="
      cn(
        'sgu:@container/card-header sgu:grid sgu:auto-rows-min sgu:grid-rows-[auto_auto] sgu:items-start sgu:gap-1.5 sgu:px-6 sgu:has-data-[slot=card-action]:grid-cols-[1fr_auto] sgu:[.border-b]:pb-6',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>

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
    data-slot="card-action"
    :class="
      cn(
        'sgu:col-start-2 sgu:row-span-2 sgu:row-start-1 sgu:self-start sgu:justify-self-end',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>

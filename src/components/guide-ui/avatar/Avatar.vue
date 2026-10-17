<script setup>
import { cn } from "@/style-guide/utils";
import { AvatarRoot } from "reka-ui";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <AvatarRoot
    data-slot="avatar"
    :class="
      cn(
        'sgu:relative sgu:flex sgu:size-8 sgu:shrink-0 sgu:overflow-hidden sgu:rounded-full',
        props.class,
      )
    "
  >
    <slot />
  </AvatarRoot>
</template>

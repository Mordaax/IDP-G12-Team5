<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import { AvatarFallback } from "reka-ui";

const props = defineProps({
  delayMs: { type: Number, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <AvatarFallback
    data-slot="avatar-fallback"
    v-bind="delegatedProps"
    :class="
      cn(
        'sgu:bg-muted sgu:flex sgu:size-full sgu:items-center sgu:justify-center sgu:rounded-full',
        props.class,
      )
    "
  >
    <slot />
  </AvatarFallback>
</template>

<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import { DialogOverlay } from "reka-ui";

const props = defineProps({
  forceMount: { type: Boolean, required: false },
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
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="
      cn(
        'sgu:data-[state=open]:animate-in sgu:data-[state=closed]:animate-out sgu:data-[state=closed]:fade-out-0 sgu:data-[state=open]:fade-in-0 sgu:fixed sgu:inset-0 sgu:z-50 sgu:bg-black/80',
        props.class,
      )
    "
  >
    <slot />
  </DialogOverlay>
</template>

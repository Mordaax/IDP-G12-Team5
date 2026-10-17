<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import { Label } from "reka-ui";

const props = defineProps({
  for: { type: String, required: false },
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
  <Label
    data-slot="label"
    v-bind="delegatedProps"
    :class="
      cn(
        'sgu:flex sgu:items-center sgu:gap-2 sgu:text-sm sgu:leading-none sgu:font-medium sgu:select-none sgu:group-data-[disabled=true]:pointer-events-none sgu:group-data-[disabled=true]:opacity-50 sgu:peer-disabled:cursor-not-allowed sgu:peer-disabled:opacity-50',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>

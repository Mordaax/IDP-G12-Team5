<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import { TabsList } from "reka-ui";

const props = defineProps({
  loop: { type: Boolean, required: false },
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
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="
      cn(
        'sgu:bg-muted sgu:text-muted-foreground sgu:inline-flex sgu:h-9 sgu:w-fit sgu:items-center sgu:justify-center sgu:rounded-lg sgu:p-0.75',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>

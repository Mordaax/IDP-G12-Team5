<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import { TabsTrigger, useForwardProps } from "reka-ui";

const props = defineProps({
  value: { type: [String, Number], required: true },
  disabled: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TabsTrigger
    data-slot="tabs-trigger"
    :class="
      cn(
        `sgu:data-[state=active]:bg-background sgu:dark:data-[state=active]:text-foreground sgu:focus-visible:border-ring sgu:focus-visible:ring-ring/50 sgu:focus-visible:outline-ring sgu:dark:data-[state=active]:border-input sgu:dark:data-[state=active]:bg-input/30 sgu:text-foreground sgu:dark:text-muted-foreground sgu:inline-flex sgu:h-[calc(100%-1px)] sgu:flex-1 sgu:items-center sgu:justify-center sgu:gap-1.5 sgu:rounded-md sgu:border sgu:border-transparent sgu:px-2 sgu:py-1 sgu:text-sm sgu:font-medium sgu:whitespace-nowrap sgu:transition-[color,box-shadow] sgu:focus-visible:ring-3 sgu:focus-visible:outline-1 sgu:disabled:pointer-events-none sgu:disabled:opacity-50 sgu:data-[state=active]:shadow-sm sgu:[&_svg]:pointer-events-none sgu:[&_svg]:shrink-0 sgu:[&_svg:not([class*='size-'])]:size-4`,
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </TabsTrigger>
</template>

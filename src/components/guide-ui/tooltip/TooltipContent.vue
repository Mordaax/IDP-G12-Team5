<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  useForwardPropsEmits,
} from "reka-ui";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  forceMount: { type: Boolean, required: false },
  ariaLabel: { type: String, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  side: { type: null, required: false },
  sideOffset: { type: Number, required: false, default: 4 },
  align: { type: null, required: false },
  alignOffset: { type: Number, required: false },
  avoidCollisions: { type: Boolean, required: false },
  collisionBoundary: { type: null, required: false },
  collisionPadding: { type: [Number, Object], required: false },
  arrowPadding: { type: Number, required: false },
  sticky: { type: String, required: false },
  hideWhenDetached: { type: Boolean, required: false },
  positionStrategy: { type: String, required: false },
  updatePositionStrategy: { type: String, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});

const emits = defineEmits(["escapeKeyDown", "pointerDownOutside"]);

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <TooltipPortal to="#sg-portals">
    <TooltipContent
      data-slot="tooltip-content"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="
        cn(
          'sgu:bg-foreground sgu:text-background sgu:animate-in sgu:fade-in-0 sgu:zoom-in-95 sgu:data-[state=closed]:animate-out sgu:data-[state=closed]:fade-out-0 sgu:data-[state=closed]:zoom-out-95 sgu:data-[side=bottom]:slide-in-from-top-2 sgu:data-[side=left]:slide-in-from-right-2 sgu:data-[side=right]:slide-in-from-left-2 sgu:data-[side=top]:slide-in-from-bottom-2 sgu:z-50 sgu:w-fit sgu:rounded-md sgu:px-3 sgu:py-1.5 sgu:text-xs sgu:text-balance',
          props.class,
        )
      "
    >
      <slot />

      <TooltipArrow
        class="sgu:bg-foreground sgu:fill-foreground sgu:z-50 sgu:size-2.5 sgu:translate-y-[calc(-50%_-_2px)] sgu:rotate-45 sgu:rounded-xs"
      />
    </TooltipContent>
  </TooltipPortal>
</template>

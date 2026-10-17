<script setup>
import { X } from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  forceMount: { type: Boolean, required: false },
  disableOutsidePointerEvents: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
const emits = defineEmits([
  "escapeKeyDown",
  "pointerDownOutside",
  "focusOutside",
  "interactOutside",
  "openAutoFocus",
  "closeAutoFocus",
]);

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal to="#sg-portals">
    <DialogOverlay
      class="sgu:fixed sgu:inset-0 sgu:z-50 sgu:grid sgu:place-items-center sgu:overflow-y-auto sgu:bg-black/80 sgu:data-[state=open]:animate-in sgu:data-[state=closed]:animate-out sgu:data-[state=closed]:fade-out-0 sgu:data-[state=open]:fade-in-0"
    >
      <DialogContent
        :class="
          cn(
            'sgu:relative sgu:z-50 sgu:grid sgu:w-full sgu:max-w-lg sgu:my-8 sgu:gap-4 sgu:border sgu:border-border sgu:bg-background sgu:p-6 sgu:shadow-lg sgu:duration-200 sgu:sm:rounded-lg sgu:md:w-full',
            props.class,
          )
        "
        v-bind="{ ...$attrs, ...forwarded }"
        @pointer-down-outside="
          (event) => {
            const originalEvent = event.detail.originalEvent;
            const target = originalEvent.target;
            if (
              originalEvent.offsetX > target.clientWidth ||
              originalEvent.offsetY > target.clientHeight
            ) {
              event.preventDefault();
            }
          }
        "
      >
        <slot />

        <DialogClose
          class="sgu:absolute sgu:top-4 sgu:right-4 sgu:p-0.5 sgu:transition-colors sgu:rounded-md sgu:hover:bg-secondary"
        >
          <X class="sgu:w-4 sgu:h-4" />
          <span class="sgu:sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>

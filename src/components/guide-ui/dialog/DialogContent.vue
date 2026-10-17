<script setup>
import { X } from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui";
import DialogOverlay from "./DialogOverlay.vue";

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
  showCloseButton: { type: Boolean, required: false, default: true },
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
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'sgu:bg-background sgu:data-[state=open]:animate-in sgu:data-[state=closed]:animate-out sgu:data-[state=closed]:fade-out-0 sgu:data-[state=open]:fade-in-0 sgu:data-[state=closed]:zoom-out-95 sgu:data-[state=open]:zoom-in-95 sgu:fixed sgu:top-[50%] sgu:left-[50%] sgu:z-50 sgu:grid sgu:w-full sgu:max-w-[calc(100%-2rem)] sgu:translate-x-[-50%] sgu:translate-y-[-50%] sgu:gap-4 sgu:rounded-lg sgu:border sgu:p-6 sgu:shadow-lg sgu:duration-200 sgu:sm:max-w-lg',
          props.class,
        )
      "
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        data-slot="dialog-close"
        class="sgu:ring-offset-background sgu:focus:ring-ring sgu:data-[state=open]:bg-accent sgu:data-[state=open]:text-muted-foreground sgu:absolute sgu:top-4 sgu:right-4 sgu:rounded-xs sgu:opacity-70 sgu:transition-opacity sgu:hover:opacity-100 sgu:focus:ring-2 sgu:focus:ring-offset-2 sgu:focus:outline-hidden sgu:disabled:pointer-events-none sgu:[&_svg]:pointer-events-none sgu:[&_svg]:shrink-0 sgu:[&_svg:not([class*='size-'])]:size-4"
      >
        <X />
        <span class="sgu:sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>

<script setup>
import { cn } from "@/style-guide/utils";
import { DialogClose } from "reka-ui";
import { Button } from '@/components/guide-ui/button';

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
  showCloseButton: { type: Boolean, required: false, default: false },
});
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="
      cn('sgu:flex sgu:flex-col-reverse sgu:gap-2 sgu:sm:flex-row sgu:sm:justify-end', props.class)
    "
  >
    <slot />
    <DialogClose v-if="showCloseButton" as-child>
      <Button variant="outline"> Close </Button>
    </DialogClose>
  </div>
</template>

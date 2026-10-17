<script setup>
import { useVModel } from "@vueuse/core";
import { cn } from "@/style-guide/utils";

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
  defaultValue: { type: [String, Number], required: false },
  modelValue: { type: [String, Number], required: false },
});

const emits = defineEmits(["update:modelValue"]);

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :class="
      cn(
        'sgu:border-input sgu:placeholder:text-muted-foreground sgu:focus-visible:border-ring sgu:focus-visible:ring-ring/50 sgu:aria-invalid:ring-destructive/20 sgu:dark:aria-invalid:ring-destructive/40 sgu:aria-invalid:border-destructive sgu:dark:bg-input/30 sgu:flex sgu:field-sizing-content sgu:min-h-16 sgu:w-full sgu:rounded-md sgu:border sgu:bg-transparent sgu:px-3 sgu:py-2 sgu:text-base sgu:shadow-xs sgu:transition-[color,box-shadow] sgu:outline-none sgu:focus-visible:ring-3 sgu:disabled:cursor-not-allowed sgu:disabled:opacity-50 sgu:md:text-sm',
        props.class,
      )
    "
  />
</template>

<script setup>
import { useVModel } from "@vueuse/core";
import { cn } from "@/style-guide/utils";

const props = defineProps({
  defaultValue: { type: [String, Number], required: false },
  modelValue: { type: [String, Number], required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});

const emits = defineEmits(["update:modelValue"]);

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="
      cn(
        'sgu:file:text-foreground sgu:placeholder:text-muted-foreground sgu:selection:bg-primary sgu:selection:text-primary-foreground sgu:dark:bg-input/30 sgu:border-input sgu:h-9 sgu:w-full sgu:min-w-0 sgu:rounded-md sgu:border sgu:bg-transparent sgu:px-3 sgu:py-1 sgu:text-base sgu:shadow-xs sgu:transition-[color,box-shadow] sgu:outline-none sgu:file:inline-flex sgu:file:h-7 sgu:file:border-0 sgu:file:bg-transparent sgu:file:text-sm sgu:file:font-medium sgu:disabled:pointer-events-none sgu:disabled:cursor-not-allowed sgu:disabled:opacity-50 sgu:md:text-sm',
        'sgu:focus-visible:border-ring sgu:focus-visible:ring-ring/50 sgu:focus-visible:ring-3',
        'sgu:aria-invalid:ring-destructive/20 sgu:dark:aria-invalid:ring-destructive/40 sgu:aria-invalid:border-destructive',
        props.class,
      )
    "
  />
</template>

<script setup>
import { Check } from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui";

const props = defineProps({
  defaultValue: { type: null, required: false },
  modelValue: { type: null, required: false },
  disabled: { type: Boolean, required: false },
  value: { type: null, required: false },
  id: { type: String, required: false },
  trueValue: { type: null, required: false },
  falseValue: { type: null, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  name: { type: String, required: false },
  required: { type: Boolean, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
const emits = defineEmits(["update:modelValue"]);

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    v-slot="slotProps"
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn(
        'sgu:peer sgu:border-input sgu:data-[state=checked]:bg-primary sgu:data-[state=checked]:text-primary-foreground sgu:data-[state=checked]:border-primary sgu:focus-visible:border-ring sgu:focus-visible:ring-ring/50 sgu:aria-invalid:ring-destructive/20 sgu:dark:aria-invalid:ring-destructive/40 sgu:aria-invalid:border-destructive sgu:size-4 sgu:shrink-0 sgu:rounded-[4px] sgu:border sgu:shadow-xs sgu:transition-shadow sgu:outline-none sgu:focus-visible:ring-3 sgu:disabled:cursor-not-allowed sgu:disabled:opacity-50',
        props.class,
      )
    "
  >
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="sgu:grid sgu:place-content-center sgu:text-current sgu:transition-none"
    >
      <slot v-bind="slotProps">
        <Check class="sgu:size-3.5" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

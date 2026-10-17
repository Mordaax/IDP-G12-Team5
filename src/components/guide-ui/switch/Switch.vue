<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/style-guide/utils";
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from "reka-ui";

const props = defineProps({
  defaultValue: { type: null, required: false },
  modelValue: { type: null, required: false },
  disabled: { type: Boolean, required: false },
  id: { type: String, required: false },
  value: { type: String, required: false },
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
  <SwitchRoot
    v-slot="slotProps"
    data-slot="switch"
    v-bind="forwarded"
    :class="
      cn(
        'sgu:peer sgu:data-[state=checked]:bg-primary sgu:data-[state=unchecked]:bg-input sgu:focus-visible:border-ring sgu:focus-visible:ring-ring/50 sgu:dark:data-[state=unchecked]:bg-input/80 sgu:inline-flex sgu:h-[1.15rem] sgu:w-8 sgu:shrink-0 sgu:items-center sgu:rounded-full sgu:border sgu:border-transparent sgu:shadow-xs sgu:transition-all sgu:outline-none sgu:focus-visible:ring-3 sgu:disabled:cursor-not-allowed sgu:disabled:opacity-50',
        props.class,
      )
    "
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="
        cn(
          'sgu:bg-background sgu:dark:data-[state=unchecked]:bg-foreground sgu:dark:data-[state=checked]:bg-primary-foreground sgu:pointer-events-none sgu:block sgu:size-4 sgu:rounded-full sgu:ring-0 sgu:transition-transform sgu:data-[state=checked]:translate-x-[calc(100%-2px)] sgu:data-[state=unchecked]:translate-x-0',
        )
      "
    >
      <slot name="thumb" v-bind="slotProps" />
    </SwitchThumb>
  </SwitchRoot>
</template>

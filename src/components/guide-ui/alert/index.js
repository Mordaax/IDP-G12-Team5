import { cva } from "class-variance-authority";

export { default as Alert } from "./Alert.vue";
export { default as AlertDescription } from "./AlertDescription.vue";
export { default as AlertTitle } from "./AlertTitle.vue";

export const alertVariants = cva(
  "sgu:relative sgu:w-full sgu:rounded-lg sgu:border sgu:px-4 sgu:py-3 sgu:text-sm sgu:grid sgu:has-[>svg]:grid-cols-[calc(var(--sg-spacing)*4)_1fr] sgu:grid-cols-[0_1fr] sgu:has-[>svg]:gap-x-3 sgu:gap-y-0.5 sgu:items-start sgu:[&>svg]:size-4 sgu:[&>svg]:translate-y-0.5 sgu:[&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "sgu:bg-card sgu:text-card-foreground",
        destructive:
          "sgu:text-destructive sgu:bg-card sgu:[&>svg]:text-current sgu:*:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

import { cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = cva(
  "sgu:inline-flex sgu:items-center sgu:justify-center sgu:rounded-full sgu:border sgu:px-2 sgu:py-0.5 sgu:text-xs sgu:font-medium sgu:w-fit sgu:whitespace-nowrap sgu:shrink-0 sgu:[&>svg]:size-3 sgu:gap-1 sgu:[&>svg]:pointer-events-none sgu:focus-visible:border-ring sgu:focus-visible:ring-ring/50 sgu:focus-visible:ring-3 sgu:aria-invalid:ring-destructive/20 sgu:dark:aria-invalid:ring-destructive/40 sgu:aria-invalid:border-destructive sgu:transition-[color,box-shadow] sgu:overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "sgu:border-transparent sgu:bg-primary sgu:text-primary-foreground sgu:[a&]:hover:bg-primary/90",
        secondary:
          "sgu:border-transparent sgu:bg-secondary sgu:text-secondary-foreground sgu:[a&]:hover:bg-secondary/90",
        destructive:
          "sgu:border-transparent sgu:bg-destructive sgu:text-white sgu:[a&]:hover:bg-destructive/90 sgu:focus-visible:ring-destructive/20 sgu:dark:focus-visible:ring-destructive/40 sgu:dark:bg-destructive/60",
        outline:
          "sgu:text-foreground sgu:[a&]:hover:bg-accent sgu:[a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

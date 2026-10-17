import { cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "sgu:inline-flex sgu:items-center sgu:justify-center sgu:gap-2 sgu:whitespace-nowrap sgu:rounded-md sgu:text-sm sgu:font-medium sgu:transition-all sgu:disabled:pointer-events-none sgu:disabled:opacity-50 sgu:[&_svg]:pointer-events-none sgu:[&_svg:not([class*='size-'])]:size-4 sgu:shrink-0 sgu:[&_svg]:shrink-0 sgu:outline-none sgu:focus-visible:border-ring sgu:focus-visible:ring-ring/50 sgu:focus-visible:ring-3 sgu:aria-invalid:ring-destructive/20 sgu:dark:aria-invalid:ring-destructive/40 sgu:aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "sgu:bg-primary sgu:text-primary-foreground sgu:hover:bg-primary/90",
        destructive:
          "sgu:bg-destructive sgu:text-white sgu:hover:bg-destructive/90 sgu:focus-visible:ring-destructive/20 sgu:dark:focus-visible:ring-destructive/40 sgu:dark:bg-destructive/60",
        outline:
          "sgu:border sgu:bg-background sgu:shadow-xs sgu:hover:bg-accent sgu:hover:text-accent-foreground sgu:dark:bg-input/30 sgu:dark:border-input sgu:dark:hover:bg-input/50",
        secondary:
          "sgu:bg-secondary sgu:text-secondary-foreground sgu:hover:bg-secondary/80",
        ghost:
          "sgu:hover:bg-accent sgu:hover:text-accent-foreground sgu:dark:hover:bg-accent/50",
        link: "sgu:text-primary sgu:underline-offset-4 sgu:hover:underline",
      },
      size: {
        default: "sgu:h-9 sgu:px-4 sgu:py-2 sgu:has-[>svg]:px-3",
        xs: "sgu:h-6 sgu:gap-1 sgu:rounded-md sgu:px-2 sgu:text-xs sgu:has-[>svg]:px-1.5 sgu:[&_svg:not([class*='size-'])]:size-3",
        sm: "sgu:h-8 sgu:rounded-md sgu:gap-1.5 sgu:px-3 sgu:has-[>svg]:px-2.5",
        lg: "sgu:h-10 sgu:rounded-md sgu:px-6 sgu:has-[>svg]:px-4",
        icon: "sgu:size-9",
        "icon-xs": "sgu:size-6 sgu:rounded-md sgu:[&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "sgu:size-8",
        "icon-lg": "sgu:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

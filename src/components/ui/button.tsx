import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-[0_0_20px_-4px_rgba(201,169,106,0.35)]",
        outline:
          "border border-border-gold bg-transparent text-foreground hover:border-primary/50 hover:bg-surface-elevated",
        ghost: "hover:bg-muted",
        secondary:
          "bg-muted text-foreground hover:bg-muted/70 border border-border",
        destructive:
          "bg-red-800 text-red-50 hover:bg-red-900 focus-visible:ring-red-700/40",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Affiche un spinner laiton, désactive le bouton et pose aria-busy. Ignoré si asChild. */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isBusy = !asChild && loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={asChild ? disabled : disabled || loading}
        aria-busy={isBusy || undefined}
        {...props}
      >
        {isBusy ? (
          <>
            <Loader2
              className="h-4 w-4 shrink-0 animate-spin text-current"
              aria-hidden
            />
            <span className="inline-flex items-center gap-2">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

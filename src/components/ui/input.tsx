import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none transition-colors",
        "placeholder:text-muted-foreground",
        "focus:border-primary focus:ring-2 focus:ring-primary/45",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:focus:border-destructive aria-invalid:focus:ring-destructive/30",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };

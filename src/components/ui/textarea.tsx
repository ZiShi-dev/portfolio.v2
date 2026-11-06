import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[140px] w-full resize-none rounded-xl border border-border bg-background/50 p-4 text-sm outline-none transition-colors",
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
Textarea.displayName = "Textarea";

export { Textarea };

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[1000] bg-black/65 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogSurfaceClass =
  "flex flex-col overflow-hidden border border-border-strong bg-card/98 shadow-[0_28px_90px_-24px_rgb(0_0_0/0.9)] outline-none duration-200 focus-visible:ring-2 focus-visible:ring-primary/40";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showClose?: boolean;
    closeLabel?: string;
    placement?: "center" | "drawer" | "sheet";
  }
>(({ className, children, showClose = true, closeLabel = "Close", placement = "center", ...props }, ref) => {
  const closeButton = showClose ? (
    <DialogPrimitive.Close
      className="absolute end-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground/65 shadow-sm outline-none backdrop-blur transition-all hover:border-primary/30 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      aria-label={closeLabel}
    >
      <X className="h-4 w-4" aria-hidden />
    </DialogPrimitive.Close>
  ) : null;

  const hairline = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent"
    />
  );

  if (placement === "drawer") {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            dialogSurfaceClass,
            "fixed inset-y-0 start-0 z-[1001] h-dvh w-[min(88vw,20rem)] gap-0 rounded-none border-y-0 border-s-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full rtl:data-[state=closed]:slide-out-to-right-full rtl:data-[state=open]:slide-in-from-right-full",
            className
          )}
          {...props}
        >
          {hairline}
          {children}
          {closeButton}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }

  if (placement === "sheet") {
    return (
      <DialogPortal>
        <DialogOverlay />
        <div className="pointer-events-none fixed inset-0 z-[1001] flex items-end justify-stretch sm:items-stretch sm:justify-end">
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              dialogSurfaceClass,
              "pointer-events-auto relative h-[min(94dvh,100%)] w-full max-w-none rounded-t-2xl rounded-b-none border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4",
              "sm:h-dvh sm:max-h-none sm:max-w-3xl sm:rounded-none sm:border-s sm:border-y-0 sm:border-e-0 sm:pb-0",
              "sm:data-[state=closed]:slide-out-to-right-full sm:data-[state=open]:slide-in-from-right-full",
              "rtl:sm:data-[state=closed]:slide-out-to-left-full rtl:sm:data-[state=open]:slide-in-from-left-full",
              className
            )}
            {...props}
          >
            <span
              aria-hidden
              className="absolute start-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-foreground/20 sm:hidden rtl:translate-x-1/2"
            />
            {hairline}
            {children}
            {closeButton}
          </DialogPrimitive.Content>
        </div>
      </DialogPortal>
    );
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <div className="pointer-events-none fixed inset-0 z-[1001] flex items-end justify-stretch sm:items-center sm:justify-center sm:p-4">
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            dialogSurfaceClass,
            "pointer-events-auto relative max-h-[min(94dvh,52rem)] w-full max-w-none gap-4 rounded-t-2xl rounded-b-none border-x-0 border-b-0 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4",
            "sm:max-h-[min(90dvh,52rem)] sm:max-w-lg sm:rounded-2xl sm:border sm:p-6 sm:pb-6 sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
            className
          )}
          {...props}
        >
          <span
            aria-hidden
            className="absolute start-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-foreground/20 sm:hidden rtl:translate-x-1/2"
          />
          {hairline}
          {children}
          {closeButton}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 pe-10 text-start", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border/70 bg-background/35 pt-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-display text-xl font-semibold leading-tight tracking-tight text-foreground", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm leading-relaxed text-foreground/60", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

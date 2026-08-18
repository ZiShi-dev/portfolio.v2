import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectLiveImageLinkProps = {
  href: string | null;
  label: string;
  children: ReactNode;
  className?: string;
};

/** Ouvre le site / la démo du projet au clic, uniquement si un lien HTTP sûr existe. */
export function ProjectLiveImageLink({
  href,
  label,
  children,
  className,
}: ProjectLiveImageLinkProps) {
  if (!href) return <>{children}</>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "group/live relative block outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated",
        className
      )}
    >
      {children}
      <span
        className="pointer-events-none absolute inset-0 bg-primary/[0.0] transition-colors group-hover/live:bg-primary/[0.06]"
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full",
          "border border-border-gold bg-background/85 text-primary",
          "opacity-90 transition-opacity sm:opacity-0 sm:group-hover/live:opacity-100 sm:group-focus-visible/live:opacity-100"
        )}
        aria-hidden
      >
        <ExternalLink className="h-4 w-4" />
      </span>
    </a>
  );
}

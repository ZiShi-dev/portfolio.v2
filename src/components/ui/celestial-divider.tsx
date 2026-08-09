import { cn } from "@/lib/utils";

type CelestialDividerProps = {
  className?: string;
  /** Référence catalogue optionnelle (ex. VZ—DIV) */
  label?: string;
};

/** Séparateur hairline — étoile — hairline. Très discret. */
export function CelestialDivider({ className, label }: CelestialDividerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-2",
        className
      )}
      role="separator"
      aria-hidden={!label}
      aria-label={label}
    >
      <span className="h-px w-12 bg-border-gold sm:w-20" />
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/35" />
        <span className="h-1 w-1 rounded-full bg-primary/80" />
      </span>
      {label ? (
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-primary/50">
          {label}
        </span>
      ) : null}
      <span className="h-px w-12 bg-border-gold sm:w-20" />
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

type ChoiceOption = {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /** Force LTR pour montants / plages numériques en contexte RTL. */
  titleDir?: "ltr" | "rtl";
};

type ChoiceCardsProps = {
  options: ChoiceOption[];
  value?: string | null;
  onSelect: (id: string) => void;
  name: string;
  disabled?: boolean;
};

export function ChoiceCards({
  options,
  value,
  onSelect,
  name,
  disabled,
}: ChoiceCardsProps) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className="grid gap-3 sm:grid-cols-2"
    >
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onSelect(opt.id)}
            className={cn(
              "min-h-11 rounded-xl border px-4 py-3.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              selected
                ? "border-primary/50 bg-surface-elevated text-foreground"
                : "border-border bg-surface/60 text-foreground/85 hover:border-border-gold hover:bg-surface-elevated/80"
            )}
          >
            <span className="flex items-start gap-3">
              {opt.icon ? (
                <span className="mt-0.5 text-primary/80" aria-hidden>
                  {opt.icon}
                </span>
              ) : null}
              <span className="min-w-0">
                <span
                  className="block font-medium leading-snug"
                  dir={opt.titleDir}
                  style={
                    opt.titleDir === "ltr"
                      ? { unicodeBidi: "isolate" }
                      : undefined
                  }
                >
                  {opt.title}
                </span>
                {opt.description ? (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {opt.description}
                  </span>
                ) : null}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="sr-only">{name}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt, index) => {
          const selected = value === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onSelect(opt.id)}
              layout={false}
              initial={
                reduceMotion ? false : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0.01 : 0.22,
                delay: reduceMotion ? 0 : Math.min(index, 10) * 0.04,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={
                reduceMotion || disabled
                  ? undefined
                  : { y: -1 }
              }
              whileTap={
                reduceMotion || disabled ? undefined : { scale: 0.995 }
              }
              className={cn(
                "min-h-11 rounded-xl border px-4 py-3.5 text-start transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 motion-reduce:transition-none",
                selected
                  ? "border-primary/55 bg-surface-elevated text-foreground shadow-[0_0_0_1px_rgba(201,169,106,0.12),0_12px_40px_-18px_rgba(0,0,0,0.55)]"
                  : "border-border bg-surface/60 text-foreground/85 hover:border-border-gold hover:bg-surface-elevated/80"
              )}
            >
              <span className="flex items-start gap-3">
                {opt.icon ? (
                  <span
                    className={cn(
                      "mt-0.5 text-primary/80 transition-transform duration-200 motion-reduce:transition-none",
                      selected && "text-primary"
                    )}
                    aria-hidden
                  >
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
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}

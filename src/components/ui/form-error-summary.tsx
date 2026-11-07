"use client";

import { useEffect, useRef } from "react";

export type FormErrorSummaryItem = {
  id: string;
  label: string;
  message: string;
};

type FormErrorSummaryProps = {
  id: string;
  title: string;
  items: FormErrorSummaryItem[];
  /** Incrémenté uniquement après un envoi invalide, pour y déplacer le focus. */
  focusToken: number;
};

export function FormErrorSummary({
  id,
  title,
  items,
  focusToken,
}: FormErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusToken === 0 || items.length === 0) return;
    ref.current?.focus();
  }, [focusToken, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      ref={ref}
      id={id}
      tabIndex={-1}
      role="alert"
      aria-labelledby={`${id}-title`}
      className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <p id={`${id}-title`} className="text-sm font-medium text-danger">
        {title}
      </p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-danger underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={(event) => {
                const field = document.getElementById(item.id);
                if (!field) return;
                event.preventDefault();
                field.scrollIntoView({
                  block: "center",
                  behavior: "auto",
                });
                field.focus();
              }}
            >
              {item.label} — {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

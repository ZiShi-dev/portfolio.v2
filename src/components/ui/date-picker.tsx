"use client";

import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ar as arDateFns, enUS, fr as frDateFns } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  type CalendarLocale,
} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DATE_FNS_LOCALES = {
  fr: frDateFns,
  en: enUS,
  ar: arDateFns,
} as const;

function parseIsoDate(value: string | null | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return undefined;
  }
  return date;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  locale?: CalendarLocale;
  placeholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
  ariaDescribedBy?: string;
  invalid?: boolean;
  /** Empêche les dates antérieures à aujourd’hui. */
  disablePast?: boolean;
};

export function DatePicker({
  id,
  value,
  onChange,
  locale = "fr",
  placeholder = "—",
  clearLabel = "Clear",
  disabled = false,
  className,
  ariaDescribedBy,
  invalid = false,
  disablePast = true,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseIsoDate(value), [value]);
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const display = selected
    ? format(selected, "d MMMM yyyy", { locale: DATE_FNS_LOCALES[locale] })
    : placeholder;

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-describedby={ariaDescribedBy}
            aria-invalid={invalid || undefined}
            className={cn(
              "h-12 min-h-12 flex-1 justify-start rounded-xl border-border bg-background/50 px-4 font-normal hover:bg-surface-elevated",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate" dir="ltr">
              {display}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <Calendar
            mode="single"
            locale={locale}
            selected={selected}
            defaultMonth={selected ?? todayStart}
            onSelect={(date) => {
              if (!date) {
                onChange("");
                return;
              }
              onChange(toIsoDate(date));
              setOpen(false);
            }}
            disabled={disablePast ? { before: todayStart } : undefined}
            startMonth={disablePast ? todayStart : undefined}
          />
        </PopoverContent>
      </Popover>
      {selected ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-xl border border-border"
          aria-label={clearLabel}
          disabled={disabled}
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}

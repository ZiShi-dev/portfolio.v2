"use client";

import {
  DayPicker,
  type PropsBase,
  type PropsSingle,
} from "react-day-picker";
import { ar, enUS, fr } from "react-day-picker/locale";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

const LOCALES = {
  fr,
  en: enUS,
  ar,
} as const;

export type CalendarLocale = keyof typeof LOCALES;

export type CalendarProps = Omit<PropsBase & PropsSingle, "locale" | "dir"> & {
  locale?: CalendarLocale;
};

export function Calendar({
  className,
  locale = "fr",
  classNames,
  mode = "single",
  ...props
}: CalendarProps) {
  const isRtl = locale === "ar";

  return (
    <DayPicker
      mode={mode}
      locale={LOCALES[locale]}
      dir={isRtl ? "rtl" : "ltr"}
      weekStartsOn={locale === "en" ? 0 : 1}
      numerals="latn"
      className={cn(
        "rdp-vorzix font-sans text-sm text-foreground [--rdp-accent-color:#C9A96A] [--rdp-accent-background-color:rgba(201,169,106,0.16)] [--rdp-today-color:#E5C98F] [--rdp-day_button-border-radius:10px] [--rdp-outside-opacity:0.35]",
        className
      )}
      classNames={{
        root: cn("rdp-root", classNames?.root),
        ...classNames,
      }}
      {...props}
    />
  );
}

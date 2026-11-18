"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { markLocaleChange, setNextLocaleCookie } from "@/lib/locale-cookie";
import { getLocaleDirection, routing, type Locale } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export function AdminLanguageSwitcher() {
  const t = useTranslations("admin.language");
  const tLang = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();

  function switchLocale(next: string) {
    if (!routing.locales.includes(next as Locale) || next === locale) return;
    const nextLocale = next as Locale;
    if (!setNextLocaleCookie(nextLocale)) return;
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = getLocaleDirection(nextLocale);
    markLocaleChange();
    router.refresh();
  }

  const current = locale as Locale;

  return (
    <Select dir={getLocaleDirection(current)} value={locale} onValueChange={switchLocale}>
      <SelectTrigger
        className="h-11 w-11 shrink-0 touch-manipulation justify-center gap-0 overflow-hidden rounded-[var(--radius-md)] border-border bg-transparent px-0 font-mono text-[11px] font-medium max-sm:[&>svg]:hidden sm:w-[7.5rem] sm:justify-between sm:gap-2 sm:px-3 sm:font-sans sm:text-xs"
        aria-label={`${t("label")}, ${tLang(locale)}`}
      >
        <span className="uppercase sm:!hidden" dir="ltr">
          {locale}
        </span>
        <span
          lang={current}
          dir={getLocaleDirection(current)}
          className="!hidden min-w-0 truncate sm:!inline"
        >
          {tLang(locale)}
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        {routing.locales.map((code) => (
          <SelectItem
            key={code}
            value={code}
            lang={code}
            dir={getLocaleDirection(code)}
          >
            {tLang(code)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

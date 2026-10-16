"use client";

import { useLocale } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/routing";
import { markLocaleChange, setNextLocaleCookie } from "@/lib/locale-cookie";
import { cn } from "@/lib/utils";
import { useTransition } from "react";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
  /** Sans bordure externe — à utiliser dans la barre d’actions de la navbar. */
  embedded?: boolean;
  onNavigate?: (navigate: () => void) => void;
};

export function LanguageSwitcher({ className, compact, embedded, onNavigate }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const [pending, startTransition] = useTransition();

  function prefetchLocale(code: Locale) {
    if (code === locale) return;
    const href = getPathname({ href: pathname, locale: code });
    router.prefetch(`${href}${window.location.search}`);
  }

  function switchLocale(code: Locale) {
    if (code === locale) return;

    const navigate = () => {
      if (!setNextLocaleCookie(code)) return;
      markLocaleChange();
      // Pass the complete destination to the router; never race its URL update.
      const localizedPath = getPathname({ href: pathname, locale: code });
      const href = `${localizedPath}${window.location.search}${window.location.hash}`;
      startTransition(() => router.replace(href, { scroll: false }));
    };
    if (onNavigate) onNavigate(navigate);
    else navigate();
  }

  return (
    <div
      className={cn(
        "flex items-center",
        embedded
          ? "gap-0.5"
          : "gap-0.5 rounded-full border border-border bg-background/80 p-0.5",
        className
      )}
      role="group"
      aria-label="Français / English / العربية"
      aria-busy={pending}
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLocale(code)}
          onPointerEnter={() => prefetchLocale(code)}
          onFocus={() => prefetchLocale(code)}
          onTouchStart={() => prefetchLocale(code)}
          disabled={pending}
          lang={code}
          dir={code === "ar" ? "rtl" : "ltr"}
          translate="no"
          className={cn(
            "rounded-full text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait disabled:opacity-60",
            embedded
              ? "min-h-11 min-w-11 px-3 py-2"
              : "min-h-11 min-w-11 px-3 py-2",
            locale === code
              ? "bg-step-accent text-primary-foreground shadow-sm"
              : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
          )}
          aria-current={locale === code ? "true" : undefined}
          aria-label={localeLabels[code]}
        >
          {compact ? code.toUpperCase() : localeLabels[code]}
        </button>
      ))}
    </div>
  );
}

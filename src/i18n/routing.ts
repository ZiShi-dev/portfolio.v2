import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "fr",
  // Français sur `/`, traductions indexables sur `/en` et `/ar`.
  localePrefix: "as-needed",
  // L’URL fait foi : `/` reste français même si le cookie ou
  // Accept-Language est `ar`. Sinon le retour vers FR depuis /ar
  // est réécrit vers l’arabe.
  localeDetection: false,
  localeCookie: {
    name: "NEXT_LOCALE",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const localeLabels: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const ogLocales: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_US",
  ar: "ar_SA",
};

export function getLocaleDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

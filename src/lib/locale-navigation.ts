import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type LocaleSwitchOptions = {
  search?: string;
  hash?: string;
};

/**
 * URL cible lors d’un changement de langue.
 * Respecte `localePrefix: "as-needed"` — le français reste sans préfixe `/fr`.
 */
export function getLocaleSwitchHref(
  pathname: string,
  locale: Locale,
  options: LocaleSwitchOptions = {}
): string {
  const target = getPathname({ href: pathname, locale });
  const search = options.search ?? "";
  const hash = options.hash ?? "";
  return `${target}${search}${hash}`;
}

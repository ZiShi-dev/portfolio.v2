/** Event + helper pour démarrer la barre de progression de navigation au clic. */

export const NAVIGATION_START_EVENT = "vorzix:navigation-start";

/** Déclenche immédiatement la barre de progression (avant le changement de route). */
export function startNavigationProgress() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}

/**
 * True si le lien est une navigation interne (même origine, pas d’ancre seule,
 * pas mailto/tel, pas nouvel onglet).
 */
export function isInternalNavigationAnchor(
  anchor: HTMLAnchorElement,
  event: MouseEvent
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const target = anchor.getAttribute("target");
  if (target && target !== "_self") return false;

  const download = anchor.hasAttribute("download");
  if (download) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;

  // Même page + seule hash → pas de navigation App Router
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return false;
  }

  return true;
}

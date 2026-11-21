function isHtmlElement(value: unknown): value is HTMLElement {
  return typeof HTMLElement !== "undefined" && value instanceof HTMLElement;
}

/** Défile jusqu’à une ancre (`#faq`, `faq`, etc.), sous le menu fixe. */
export function scrollToSection(
  hash: string,
  behavior: ScrollBehavior = "auto"
): boolean {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;

  const heading = typeof el.querySelector === "function"
    ? el.querySelector("h1, h2, h3")
    : null;
  const anchor = isHtmlElement(heading) ? heading : el;
  const header = document.querySelector?.("header");
  const canMeasure = typeof anchor.getBoundingClientRect === "function"
    && typeof window.scrollTo === "function"
    && isHtmlElement(header);

  if (canMeasure) {
    const offset = header.getBoundingClientRect().height + 12;
    const top = anchor.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior });
  } else {
    el.scrollIntoView({ behavior, block: "start" });
  }

  if (isHtmlElement(anchor) && typeof anchor.focus === "function") {
    if (!anchor.hasAttribute("tabindex")) anchor.tabIndex = -1;
    anchor.focus({ preventScroll: true });
  }
  return true;
}

export function scrollBehaviorForMotion(): ScrollBehavior {
  return "auto";
}

/**
 * Attend que la cible soit dans le DOM (sections dynamiques / splash),
 * puis défile. Annulé via le callback retourné.
 */
export function waitAndScrollToHash(
  hash: string,
  timeoutMs = 12000
): () => void {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return () => {};

  let cancelled = false;
  const started = Date.now();
  const behavior = scrollBehaviorForMotion();
  let readyFrames = 0;

  const tick = () => {
    if (cancelled) return;
    const locked = document.body.style.position === "fixed"
      || Number(document.documentElement.dataset.scrollLockCount ?? "0") > 0;
    if (locked || !document.getElementById(id)) readyFrames = 0;
    else readyFrames += 1;
    // Scroll-lock cleanup restores the old position on the next frame.
    // Let that restoration finish before applying the requested destination.
    if (readyFrames >= 3 && scrollToSection(`#${id}`, behavior)) return;
    if (Date.now() - started >= timeoutMs) return;
    window.requestAnimationFrame(tick);
  };

  tick();
  return () => {
    cancelled = true;
  };
}

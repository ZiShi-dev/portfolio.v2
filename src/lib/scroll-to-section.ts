/** Défile jusqu’à une ancre (`#faq`, `faq`, etc.). */
export function scrollToSection(
  hash: string,
  behavior: ScrollBehavior = "smooth"
): boolean {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollBehaviorForMotion(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

/**
 * Attend que la cible soit dans le DOM (sections dynamiques / splash),
 * puis défile. Annulé via le callback retourné.
 */
export function waitAndScrollToHash(
  hash: string,
  timeoutMs = 2800
): () => void {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return () => {};

  let cancelled = false;
  const started = Date.now();
  const behavior = scrollBehaviorForMotion();

  const tick = () => {
    if (cancelled) return;
    if (scrollToSection(`#${id}`, behavior)) return;
    if (Date.now() - started >= timeoutMs) return;
    window.requestAnimationFrame(tick);
  };

  tick();
  return () => {
    cancelled = true;
  };
}

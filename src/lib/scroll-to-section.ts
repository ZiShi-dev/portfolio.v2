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

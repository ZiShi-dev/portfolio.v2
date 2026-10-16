/** Restaure le scroll une fois le contenu assez haut (sections dynamiques). */
export function restoreScrollPosition(y: number) {
  if (y <= 0) return;

  let attempts = 0;
  const maxAttempts = 20;

  const apply = () => {
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
    attempts += 1;

    const tallEnough =
      document.documentElement.scrollHeight >= y + window.innerHeight * 0.5;

    if (!tallEnough && attempts < maxAttempts) {
      requestAnimationFrame(apply);
    }
  };

  requestAnimationFrame(apply);
}

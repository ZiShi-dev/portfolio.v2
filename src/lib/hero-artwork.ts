/** Selected artwork and its mobile composition share one source of truth. */
export const HERO_ARTWORK = {
  desktop: { src: "/images/hero-glass-preview.webp", width: 1600, height: 900 },
  mobile: { src: "/images/hero-glass-mobile-v1.webp", width: 841, height: 1870 },
  /** Carte de profondeur (R), masque d’étoiles (G), phase (B). Même cadrage que la photo. */
  depthDesktop: "/images/hero-glass-depth.webp",
  depthMobile: "/images/hero-glass-mobile-depth.webp",
  mobileMedia: "(max-width: 639px)",
} as const;

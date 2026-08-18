export const SITE_SOCIAL_IDS = [
  "discord",
  "whatsapp",
  "instagram",
  "tiktok",
] as const;

export type SiteSocialId = (typeof SITE_SOCIAL_IDS)[number];

export type SiteSocialLinks = Record<SiteSocialId, string>;

/**
 * Ordre de priorité des moyens de contact (réglable dans /admin/settings).
 * L’email n’en fait pas partie : il reste réservé au footer.
 */
export const DEFAULT_CONTACT_PRIORITY = [
  "whatsapp",
  "discord",
  "instagram",
  "tiktok",
] as const satisfies readonly SiteSocialId[];

/** Réglages publics éditables (email affiché + réseaux + priorité de contact). */
export type SiteSettings = SiteSocialLinks & {
  contactEmail: string;
  contactPriority: SiteSocialId[];
};

/** Fallback email affichage si BDD absente. */
export const DEFAULT_CONTACT_EMAIL = "contact@zishi.dev";

/** Défauts : pas d’icône si URL vide. */
export const DEFAULT_SITE_SOCIAL: SiteSocialLinks = {
  discord: "",
  whatsapp: "",
  instagram: "",
  tiktok: "",
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  ...DEFAULT_SITE_SOCIAL,
  contactEmail: DEFAULT_CONTACT_EMAIL,
  contactPriority: [...DEFAULT_CONTACT_PRIORITY],
};

export const SITE_SOCIAL_LABELS: Record<SiteSocialId, string> = {
  discord: "Discord",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export function isSiteSocialId(value: unknown): value is SiteSocialId {
  return (
    typeof value === "string" &&
    (SITE_SOCIAL_IDS as readonly string[]).includes(value)
  );
}

/**
 * Ramène n’importe quelle valeur stockée à une permutation complète des réseaux :
 * les entrées connues gardent leur rang, les manquantes reprennent l’ordre par défaut.
 */
export function normalizeContactPriority(value: unknown): SiteSocialId[] {
  const out: SiteSocialId[] = [];
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isSiteSocialId(item) || out.includes(item)) continue;
      out.push(item);
    }
  }
  for (const id of DEFAULT_CONTACT_PRIORITY) {
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

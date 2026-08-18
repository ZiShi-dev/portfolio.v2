import {
  DEFAULT_CONTACT_PRIORITY,
  SITE_SOCIAL_LABELS,
  normalizeContactPriority,
  type SiteSocialId,
  type SiteSocialLinks,
} from "@/data/site-social";
import { getSiteSettings } from "@/lib/social/store";

export const brand = {
  name: "VORZIX",
  owner: "VORZIX",
  titleSuffix: "Solutions digitales",
  tagline: "Sites, apps & produits digitaux",
  profileImage: "/images/logo-vorzix.png?v=x",
  profileImageAlt: "Logo VORZIX",
  /** Atlas Céleste — bannière hero. */
  heroBanner: "/images/hero-banner-atlas.jpg?v=horizon",
  heroBannerAlt:
    "VORZIX — atlas céleste, horizon doré et carte du ciel",
  email: "contact@zishi.dev", // fallback display — sourcé BDD via getPublicContactEmail()
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.zishi.dev",
  description:
    "VORZIX conçoit des sites web, applications et plateformes digitales sur-mesure — design premium, technique fiable et accompagnement par une équipe dédiée.",
} as const;

export type { SiteSocialId as FooterSocialId, SiteSocialLinks };

export type FooterSocialLink = {
  id: SiteSocialId;
  label: string;
  href: string;
  preferred?: boolean;
};

/**
 * Liens réseaux triés selon la priorité de contact réglée en admin.
 * Le premier réseau réellement renseigné devient le contact préféré.
 */
export function buildFooterSocials(
  social: SiteSocialLinks,
  priority: readonly SiteSocialId[] = DEFAULT_CONTACT_PRIORITY
): FooterSocialLink[] {
  const links = normalizeContactPriority(priority).map((id) => ({
    id,
    label: SITE_SOCIAL_LABELS[id],
    href: String(social[id] ?? "").trim(),
  }));

  const first = links.find((link) => link.href.length > 0);
  return links.map((link) =>
    link === first ? { ...link, preferred: true } : link
  );
}

/** Liens footer : sourcés depuis Supabase (admin /settings), sinon vides. */
export async function getFooterSocials(): Promise<FooterSocialLink[]> {
  const settings = await getSiteSettings();
  return buildFooterSocials(settings, settings.contactPriority);
}

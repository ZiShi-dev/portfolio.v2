import {
  SITE_SOCIAL_LABELS,
  type SiteSocialId,
  type SiteSocialLinks,
} from "@/data/site-social";
import { getSiteSocialLinks } from "@/lib/social/store";

export const brand = {
  name: "VORZIX",
  owner: "VORZIX",
  titleSuffix: "Solutions digitales",
  tagline: "Sites, apps & produits digitaux",
  profileImage: "/images/logo-vorzix.png",
  profileImageAlt: "Logo VORZIX",
  /** Atlas Céleste HD (3072×1728) — nom versionné pour éviter le cache flou. */
  heroBanner: "/images/hero-banner-atlas.jpg",
  heroBannerAlt:
    "VORZIX — atlas céleste au lever de soleil : sites web, applications et solutions digitales",
  heroBannerDark: "/images/hero-banner-atlas-dark.jpg",
  heroBannerDarkAlt:
    "VORZIX — atlas céleste, horizon doré et précision digitale",
  email: "contact@zishi.dev", // fallback display — sourcé BDD via getPublicContactEmail()
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.zishi.dev",
  description:
    "VORZIX conçoit des sites web, applications et plateformes digitales sur-mesure — design premium, technique fiable et accompagnement par une équipe dédiée.",
  preferredContactText: "Contact préféré · Discord",
} as const;

export type { SiteSocialId as FooterSocialId, SiteSocialLinks };

export type FooterSocialLink = {
  id: SiteSocialId;
  label: string;
  href: string;
  preferred?: boolean;
};

export function buildFooterSocials(
  social: SiteSocialLinks
): FooterSocialLink[] {
  return [
    {
      id: "discord",
      label: SITE_SOCIAL_LABELS.discord,
      href: social.discord,
      preferred: true,
    },
    {
      id: "whatsapp",
      label: SITE_SOCIAL_LABELS.whatsapp,
      href: social.whatsapp,
    },
    {
      id: "instagram",
      label: SITE_SOCIAL_LABELS.instagram,
      href: social.instagram,
    },
    {
      id: "tiktok",
      label: SITE_SOCIAL_LABELS.tiktok,
      href: social.tiktok,
    },
  ];
}

/** Liens footer : sourcés depuis Supabase (admin /settings), sinon vides. */
export async function getFooterSocials(): Promise<FooterSocialLink[]> {
  const social = await getSiteSocialLinks();
  return buildFooterSocials(social);
}

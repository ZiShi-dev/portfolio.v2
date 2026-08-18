import type { FooterSocialLink } from "@/lib/brand";

/** Conserve l'ordre admin et retire les réseaux sans URL publique. */
export function getConfiguredSocialLinks(
  socials: readonly FooterSocialLink[]
): FooterSocialLink[] {
  return socials.filter((social) => social.href.trim().length > 0);
}

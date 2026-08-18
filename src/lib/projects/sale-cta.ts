import type { FooterSocialLink } from "@/lib/brand";
import { isSaleCtaChannel, type SaleCtaChannel } from "@/lib/projects/schema";

export type SaleCtaButton = {
  id: SaleCtaChannel;
  href: string;
  label: string;
  primary: boolean;
};

export function normalizeSaleCtaChannels(value: unknown): SaleCtaChannel[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<SaleCtaChannel>();
  const out: SaleCtaChannel[] = [];
  for (const item of value) {
    if (!isSaleCtaChannel(item) || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

/**
 * Boutons de contact d’une page de vente : uniquement des réseaux, jamais l’email
 * ni le parcours /demarrer-un-projet. `socials` arrive déjà trié par la priorité
 * de contact réglée en admin, donc le premier réseau disponible devient le CTA principal.
 */
export function resolveSaleCtaButtons(opts: {
  channels: SaleCtaChannel[];
  socials: FooterSocialLink[];
}): SaleCtaButton[] {
  const wanted = normalizeSaleCtaChannels(opts.channels);
  if (wanted.length === 0) return [];

  const buttons: SaleCtaButton[] = [];
  for (const social of opts.socials) {
    if (!wanted.includes(social.id) || !social.href) continue;
    buttons.push({
      id: social.id,
      href: social.href,
      label: social.label,
      primary: false,
    });
  }

  if (buttons[0]) {
    buttons[0].primary = true;
  }

  return buttons;
}

import type { FooterSocialLink } from "@/lib/brand";
import {
  SALE_CTA_CHANNELS,
  isSaleCtaChannel,
  type SaleCtaChannel,
} from "@/lib/projects/schema";

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

function hrefForChannel(
  id: SaleCtaChannel,
  contacts: { email: string; socials: FooterSocialLink[] }
): string {
  if (id === "email") {
    return contacts.email ? `mailto:${contacts.email}` : "";
  }
  return contacts.socials.find((social) => social.id === id)?.href ?? "";
}

function defaultLabelForChannel(
  id: SaleCtaChannel,
  contacts: { email: string; socials: FooterSocialLink[] },
  emailLabel: string
): string {
  if (id === "email") return emailLabel;
  return contacts.socials.find((social) => social.id === id)?.label ?? id;
}

/** Boutons de contact de la page de vente — jamais le parcours /demarrer-un-projet. */
export function resolveSaleCtaButtons(opts: {
  channels: SaleCtaChannel[];
  customLabel?: string;
  email: string;
  socials: FooterSocialLink[];
  emailLabel: string;
}): SaleCtaButton[] {
  const wanted = opts.channels;
  if (wanted.length === 0) return [];
  const custom = opts.customLabel?.trim() ?? "";
  const buttons: SaleCtaButton[] = [];

  for (const id of SALE_CTA_CHANNELS) {
    if (!wanted.includes(id)) continue;
    const href = hrefForChannel(id, opts);
    if (!href) continue;
    buttons.push({
      id,
      href,
      label: defaultLabelForChannel(id, opts, opts.emailLabel),
      primary: false,
    });
  }

  if (buttons[0]) {
    buttons[0].primary = true;
    if (custom) buttons[0].label = custom;
  }

  return buttons;
}

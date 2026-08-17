/**
 * Parcours « Démarrer un projet » selon l’offre catalogue.
 * Les IDs d’objectifs / types restent ceux de project-inquiry-options
 * (schéma Zod / API inchangés). Les libellés passent par i18n.
 */

import {
  PROJECT_INQUIRY_OBJECTIVES,
  type ProjectInquiryObjective,
  type ProjectInquiryType,
} from "@/data/project-inquiry-options";

export const OFFER_INQUIRY_SLUGS = [
  "vitrine",
  "ecommerce",
  "reservation",
  "plateforme",
  "blog",
  "portfolio",
  "landing",
  "sur-mesure",
] as const;

export type OfferInquirySlug = (typeof OFFER_INQUIRY_SLUGS)[number];

export type OfferInquiryProfile = {
  slug: OfferInquirySlug | "generic";
  projectType: ProjectInquiryType;
  objectives: readonly ProjectInquiryObjective[];
};

export const OFFER_INQUIRY_PROFILES: Record<
  OfferInquirySlug,
  OfferInquiryProfile
> = {
  vitrine: {
    slug: "vitrine",
    projectType: "showcase",
    objectives: ["present_activity", "generate_leads", "modernize", "other"],
  },
  ecommerce: {
    slug: "ecommerce",
    projectType: "ecommerce",
    objectives: ["sell_online", "generate_leads", "modernize", "other"],
  },
  reservation: {
    slug: "reservation",
    projectType: "web_app",
    objectives: [
      "generate_leads",
      "present_activity",
      "automate_process",
      "other",
    ],
  },
  plateforme: {
    slug: "plateforme",
    projectType: "saas",
    objectives: [
      "create_product",
      "automate_process",
      "generate_leads",
      "other",
    ],
  },
  blog: {
    slug: "blog",
    projectType: "showcase",
    objectives: ["present_activity", "generate_leads", "other"],
  },
  portfolio: {
    slug: "portfolio",
    projectType: "showcase",
    objectives: ["present_activity", "generate_leads", "other"],
  },
  landing: {
    slug: "landing",
    projectType: "showcase",
    objectives: [
      "generate_leads",
      "sell_online",
      "present_activity",
      "other",
    ],
  },
  "sur-mesure": {
    slug: "sur-mesure",
    projectType: "other",
    objectives: [...PROJECT_INQUIRY_OBJECTIVES],
  },
};

function isOfferInquirySlug(slug: string): slug is OfferInquirySlug {
  return (OFFER_INQUIRY_SLUGS as readonly string[]).includes(slug);
}

/** Profil d’une offre publiée ; `null` si aucune offre n’est en contexte. */
export function resolveOfferInquiryProfile(
  slug: string | null | undefined,
  inquiryProjectType?: ProjectInquiryType | null
): OfferInquiryProfile | null {
  if (!slug) return null;
  if (isOfferInquirySlug(slug)) return OFFER_INQUIRY_PROFILES[slug];

  return {
    slug: "generic",
    projectType: inquiryProjectType ?? "other",
    objectives: PROJECT_INQUIRY_OBJECTIVES,
  };
}

/**
 * Options du parcours « Démarrer un projet ».
 * Les IDs sont stables en DB ; les labels passent par i18n.
 * Budgets centralisés ici uniquement.
 */

export const PROJECT_INQUIRY_TYPES = [
  "showcase",
  "ecommerce",
  "web_app",
  "saas",
  "redesign",
  "automation",
  "other",
] as const;

export type ProjectInquiryType = (typeof PROJECT_INQUIRY_TYPES)[number];

export const PROJECT_INQUIRY_OBJECTIVES = [
  "present_activity",
  "generate_leads",
  "sell_online",
  "create_product",
  "automate_process",
  "modernize",
  "other",
] as const;

export type ProjectInquiryObjective =
  (typeof PROJECT_INQUIRY_OBJECTIVES)[number];

/** Budgets — modifier ici uniquement. */
export const PROJECT_INQUIRY_BUDGETS = [
  "amount_150",
  "amount_350",
  "under_500",
  "500_1000",
  "1000_3000",
  "3000_5000",
  "5000_plus",
  "custom",
  "unknown",
] as const;

export type ProjectInquiryBudget = (typeof PROJECT_INQUIRY_BUDGETS)[number];

/** Limites du montant libre (€). */
export const PROJECT_INQUIRY_CUSTOM_BUDGET = {
  min: 50,
  max: 500_000,
} as const;

/** Limites du texte libre pour type/objectif « Autre ». */
export const PROJECT_INQUIRY_OTHER_TEXT = {
  min: 2,
  max: 120,
} as const;

export const PROJECT_INQUIRY_TIMELINES = [
  "asap",
  "this_month",
  "1_3_months",
  "later",
  "unknown",
] as const;

export type ProjectInquiryTimeline =
  (typeof PROJECT_INQUIRY_TIMELINES)[number];

export const PROJECT_INQUIRY_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
  "spam",
] as const;

export type ProjectInquiryStatus = (typeof PROJECT_INQUIRY_STATUSES)[number];

/** Branches constellation selon le type (variations SVG légères). */
export const PROJECT_INQUIRY_BRANCH: Record<
  ProjectInquiryType,
  "a" | "b" | "c" | "d" | "e"
> = {
  showcase: "a",
  ecommerce: "b",
  web_app: "c",
  saas: "d",
  redesign: "a",
  automation: "e",
  other: "e",
};

export const PROJECT_INQUIRY_STEPS = [
  "intro",
  "type",
  "objective",
  "budget",
  "timeline",
  "description",
  "contact",
  "summary",
  "success",
] as const;

export type ProjectInquiryStep = (typeof PROJECT_INQUIRY_STEPS)[number];

/** Étapes qui allument un nœud de constellation (hors intro/summary/success). */
export const PROJECT_INQUIRY_CONSTELLATION_NODES = [
  "type",
  "objective",
  "budget",
  "timeline",
  "description",
  "contact",
] as const;

export type ProjectInquiryConstellationNode =
  (typeof PROJECT_INQUIRY_CONSTELLATION_NODES)[number];

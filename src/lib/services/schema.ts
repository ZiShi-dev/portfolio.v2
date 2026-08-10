import { z } from "zod";
import { PROJECT_INQUIRY_TYPES } from "@/data/project-inquiry-options";
import { isSafeHttpUrl } from "@/lib/review-schema";

export const SERVICE_LIMITS = {
  maxBodyBytes: 120_000,
  slugMin: 2,
  slugMax: 80,
  referenceMin: 2,
  referenceMax: 32,
  iconMin: 1,
  iconMax: 48,
  titleMin: 2,
  titleMax: 120,
  shortDescriptionMax: 320,
  descriptionMax: 4000,
  idealForMax: 500,
  ctaLabelMax: 80,
  featureMax: 200,
  maxFeatures: 24,
  maxCaseStudies: 12,
  sortOrderMin: -9999,
  sortOrderMax: 9999,
  seoTitleMax: 120,
  seoDescriptionMax: 320,
  /** Plafond sécurité : 100 M d’unités majeures en centimes. */
  startingPriceCentsMax: 10_000_000_000,
  coverImageMax: 2048,
} as const;

export const SERVICE_STATUSES = ["draft", "published", "archived"] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const SERVICE_PRICING_MODES = [
  "starting_at",
  "fixed",
  "quote_only",
  "contact",
] as const;
export type ServicePricingMode = (typeof SERVICE_PRICING_MODES)[number];

/** Service sur-mesure vs produit / site à vendre (filtre catalogue). */
export const SERVICE_OFFER_KINDS = ["service", "product"] as const;
export type ServiceOfferKind = (typeof SERVICE_OFFER_KINDS)[number];

export const SERVICE_CURRENCIES = ["EUR", "USD", "GBP", "MAD", "CHF"] as const;
export type ServiceCurrency = (typeof SERVICE_CURRENCIES)[number];

export const LOCALES = ["fr", "en", "ar"] as const;
export type ServiceLocale = (typeof LOCALES)[number];

const localeOptional = (max: number) =>
  z.object({
    fr: z.string().trim().max(max).default(""),
    en: z.string().trim().max(max).default(""),
    ar: z.string().trim().max(max).default(""),
  });

const featureItemSchema = z.object({
  fr: z.string().trim().min(1).max(SERVICE_LIMITS.featureMax),
  en: z.string().trim().max(SERVICE_LIMITS.featureMax).default(""),
  ar: z.string().trim().max(SERVICE_LIMITS.featureMax).default(""),
});

const uuidSchema = z
  .string()
  .trim()
  .uuid("invalid_uuid");

export const serviceWriteSchema = z
  .object({
    reference: z
      .string()
      .trim()
      .min(SERVICE_LIMITS.referenceMin)
      .max(SERVICE_LIMITS.referenceMax),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(SERVICE_LIMITS.slugMin)
      .max(SERVICE_LIMITS.slugMax)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid_slug"),
    icon: z
      .string()
      .trim()
      .min(SERVICE_LIMITS.iconMin)
      .max(SERVICE_LIMITS.iconMax)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid_icon"),
    status: z.enum(SERVICE_STATUSES),
    featured: z.boolean().default(false),
    sortOrder: z
      .number()
      .int()
      .min(SERVICE_LIMITS.sortOrderMin)
      .max(SERVICE_LIMITS.sortOrderMax),
    title: localeOptional(SERVICE_LIMITS.titleMax),
    shortDescription: localeOptional(SERVICE_LIMITS.shortDescriptionMax),
    description: localeOptional(SERVICE_LIMITS.descriptionMax),
    idealFor: localeOptional(SERVICE_LIMITS.idealForMax),
    includedFeatures: z
      .array(featureItemSchema)
      .max(SERVICE_LIMITS.maxFeatures)
      .default([]),
    ctaLabel: localeOptional(SERVICE_LIMITS.ctaLabelMax),
    offerKind: z.enum(SERVICE_OFFER_KINDS).default("service"),
    showCtaBuy: z.boolean().default(false),
    showCtaStart: z.boolean().default(true),
    coverImage: z
      .string()
      .trim()
      .max(SERVICE_LIMITS.coverImageMax)
      .nullable()
      .optional()
      .transform((v) => {
        if (v === undefined || v === null || v === "") return null;
        return v;
      })
      .refine(
        (v) => v === null || isSafeHttpUrl(v),
        "invalid_cover_image"
      ),
    linkedProjectId: z
      .string()
      .trim()
      .uuid()
      .nullable()
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : v)),
    pricingMode: z.enum(SERVICE_PRICING_MODES),
    startingPriceCents: z
      .number()
      .int()
      .min(0)
      .max(SERVICE_LIMITS.startingPriceCentsMax)
      .nullable()
      .optional()
      .transform((v) => (v === undefined ? null : v)),
    currency: z.enum(SERVICE_CURRENCIES).default("EUR"),
    inquiryProjectType: z
      .enum(PROJECT_INQUIRY_TYPES)
      .nullable()
      .optional()
      .transform((v) => (v === undefined ? null : v)),
    caseStudyIds: z
      .array(uuidSchema)
      .max(SERVICE_LIMITS.maxCaseStudies)
      .default([])
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "duplicate_case_study"
      ),
    seoTitle: localeOptional(SERVICE_LIMITS.seoTitleMax),
    seoDescription: localeOptional(SERVICE_LIMITS.seoDescriptionMax),
  })
  .superRefine((data, ctx) => {
    if (
      data.pricingMode === "starting_at" ||
      data.pricingMode === "fixed"
    ) {
      if (
        data.startingPriceCents === null ||
        data.startingPriceCents === undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message: "starting_price_required",
          path: ["startingPriceCents"],
        });
      }
    }

    if (data.status !== "published") return;

    if (!data.title.fr?.trim() || data.title.fr.trim().length < SERVICE_LIMITS.titleMin) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_title",
        path: ["title", "fr"],
      });
    }
    if (!data.shortDescription.fr?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_short_description",
        path: ["shortDescription", "fr"],
      });
    }
    if (!data.reference.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_reference",
        path: ["reference"],
      });
    }
  });

export type ServiceWriteInput = z.infer<typeof serviceWriteSchema>;

export const servicePatchSchema = z
  .object({
    reference: serviceWriteSchema.shape.reference.optional(),
    slug: serviceWriteSchema.shape.slug.optional(),
    icon: serviceWriteSchema.shape.icon.optional(),
    status: serviceWriteSchema.shape.status.optional(),
    featured: z.boolean().optional(),
    sortOrder: serviceWriteSchema.shape.sortOrder.optional(),
    title: serviceWriteSchema.shape.title.optional(),
    shortDescription: serviceWriteSchema.shape.shortDescription.optional(),
    description: serviceWriteSchema.shape.description.optional(),
    idealFor: serviceWriteSchema.shape.idealFor.optional(),
    includedFeatures: serviceWriteSchema.shape.includedFeatures.optional(),
    ctaLabel: serviceWriteSchema.shape.ctaLabel.optional(),
    offerKind: serviceWriteSchema.shape.offerKind.optional(),
    showCtaBuy: z.boolean().optional(),
    showCtaStart: z.boolean().optional(),
    coverImage: z
      .string()
      .trim()
      .max(SERVICE_LIMITS.coverImageMax)
      .nullable()
      .optional()
      .refine(
        (v) =>
          v === undefined ||
          v === null ||
          v === "" ||
          isSafeHttpUrl(v),
        "invalid_cover_image"
      )
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null || v === "") return null;
        return v;
      }),
    linkedProjectId: z
      .string()
      .trim()
      .uuid()
      .nullable()
      .optional()
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null || v === "") return null;
        return v;
      }),
    pricingMode: serviceWriteSchema.shape.pricingMode.optional(),
    startingPriceCents: z
      .number()
      .int()
      .min(0)
      .max(SERVICE_LIMITS.startingPriceCentsMax)
      .nullable()
      .optional(),
    currency: serviceWriteSchema.shape.currency.optional(),
    inquiryProjectType: z
      .enum(PROJECT_INQUIRY_TYPES)
      .nullable()
      .optional(),
    caseStudyIds: serviceWriteSchema.shape.caseStudyIds.optional(),
    seoTitle: serviceWriteSchema.shape.seoTitle.optional(),
    seoDescription: serviceWriteSchema.shape.seoDescription.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      (data.pricingMode === "starting_at" || data.pricingMode === "fixed") &&
      data.startingPriceCents === null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "starting_price_required",
        path: ["startingPriceCents"],
      });
    }
    if (data.status === "published") {
      if (data.title !== undefined && !data.title.fr?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "publish_requires_title",
          path: ["title", "fr"],
        });
      }
      if (
        data.shortDescription !== undefined &&
        !data.shortDescription.fr?.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          message: "publish_requires_short_description",
          path: ["shortDescription", "fr"],
        });
      }
    }
  });

export type ServicePatchInput = Partial<z.infer<typeof servicePatchSchema>>;

export const serviceReorderSchema = z.object({
  orderedIds: z
    .array(uuidSchema)
    .min(1)
    .max(200)
    .refine((ids) => new Set(ids).size === ids.length, "duplicate_id"),
});

export type ServiceReorderInput = z.infer<typeof serviceReorderSchema>;

function mapServiceZodError(issues: z.core.$ZodIssue[]): string {
  const issue = issues[0];
  if (!issue) return "invalid_request";
  const path = issue.path.map(String).join(".");
  const msg = issue.message;

  if (msg === "publish_requires_title") return "publish_requires_title";
  if (msg === "publish_requires_short_description") {
    return "publish_requires_short_description";
  }
  if (msg === "publish_requires_reference") return "publish_requires_reference";
  if (msg === "starting_price_required") return "starting_price_required";
  if (msg === "invalid_slug" || path === "slug") return "service_invalid_slug";
  if (msg === "invalid_icon" || path === "icon") return "service_invalid_icon";
  if (msg === "duplicate_case_study") return "duplicate_case_study";
  if (path === "reference") return "service_invalid_reference";
  if (path.startsWith("title")) return "service_invalid_title";
  if (path.startsWith("shortDescription")) {
    return "service_invalid_short_description";
  }
  if (path.startsWith("includedFeatures")) return "service_invalid_features";
  if (path === "startingPriceCents" || path === "pricingMode") {
    return "service_invalid_pricing";
  }
  if (path === "caseStudyIds") return "service_invalid_case_studies";
  return msg || "invalid_request";
}

export function parseServiceWriteBody(
  body: unknown
):
  | { ok: true; values: ServiceWriteInput }
  | { ok: false; error: string } {
  const parsed = serviceWriteSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: mapServiceZodError(parsed.error.issues) };
  }
  return { ok: true, values: parsed.data };
}

export function parseServicePatchBody(
  body: unknown
):
  | { ok: true; values: ServicePatchInput }
  | { ok: false; error: string } {
  if (
    body === null ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return { ok: false, error: "empty_patch" };
  }
  const parsed = servicePatchSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: mapServiceZodError(parsed.error.issues) };
  }
  const values = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  ) as ServicePatchInput;
  if (Object.keys(values).length === 0) {
    return { ok: false, error: "empty_patch" };
  }
  return { ok: true, values };
}

export function parseServiceReorderBody(
  body: unknown
):
  | { ok: true; values: ServiceReorderInput }
  | { ok: false; error: string } {
  const parsed = serviceReorderSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "invalid_reorder" };
  }
  return { ok: true, values: parsed.data };
}

export function isValidServiceStatus(
  value: unknown
): value is ServiceStatus {
  return (
    typeof value === "string" &&
    (SERVICE_STATUSES as readonly string[]).includes(value)
  );
}

export function isValidServicePricingMode(
  value: unknown
): value is ServicePricingMode {
  return (
    typeof value === "string" &&
    (SERVICE_PRICING_MODES as readonly string[]).includes(value)
  );
}

/** Formate VZ—OFFRE 001 (suggestion pour duplication). */
export function formatServiceReference(n: number): string {
  const safe = Math.max(1, Math.min(9999, Math.floor(n)));
  return `VZ—${String(safe).padStart(2, "0")}`;
}

export function slugifyServiceTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SERVICE_LIMITS.slugMax);
}

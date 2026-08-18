import { z } from "zod";
import { isProjectBusinessTypeId } from "@/data/project-business-types";
import { isSafeHttpUrl } from "@/lib/review-schema";

export const PROJECT_IMAGE_BUCKET = "portfolio-projects";

export const PROJECT_LIMITS = {
  maxBodyBytes: 120_000,
  slugMin: 2,
  slugMax: 80,
  titleMin: 2,
  titleMax: 120,
  descriptionMin: 10,
  descriptionMax: 2000,
  narrativeMax: 4000,
  seoTitleMax: 120,
  seoDescriptionMax: 320,
  featureMax: 200,
  maxFeatures: 24,
  technologyMax: 48,
  maxTechnologies: 24,
  linkMax: 500,
  maxImages: 12,
  maxBusinessTypes: 4,
  imageLabelMax: 80,
  sortOrderMin: -9999,
  sortOrderMax: 9999,
  uploadMaxBytes: 3 * 1024 * 1024,
  allowedMime: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  referenceMax: 32,
  listingIntentMax: 800,
  saleCtaLabelMax: 80,
  listingPriceCentsMax: 99_999_999,
} as const;

export const PROJECT_KINDS = ["personal", "for_sale", "sold"] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

/** Conservé pour compatibilité API — la page de vente n’utilise plus le parcours projet. */
export const SALE_CTA_MODES = ["inquiry", "contacts"] as const;
export type SaleCtaMode = (typeof SALE_CTA_MODES)[number];

/** Canaux de contact affichables sur une page de vente. */
export const SALE_CTA_CHANNELS = [
  "whatsapp",
  "email",
  "discord",
  "instagram",
  "tiktok",
] as const;
export type SaleCtaChannel = (typeof SALE_CTA_CHANNELS)[number];

export function isSaleCtaChannel(value: unknown): value is SaleCtaChannel {
  return (
    typeof value === "string" &&
    (SALE_CTA_CHANNELS as readonly string[]).includes(value)
  );
}

export const LOCALES = ["fr", "en", "ar"] as const;
export type ProjectLocale = (typeof LOCALES)[number];

const localeString = (min: number, max: number) =>
  z.string().trim().min(min).max(max);

/** Champ i18n optionnel (brouillon) — chaînes vides autorisées. */
export const projectOptionalI18nSchema = z.object({
  fr: z.string().trim().max(PROJECT_LIMITS.narrativeMax).default(""),
  en: z.string().trim().max(PROJECT_LIMITS.narrativeMax).default(""),
  ar: z.string().trim().max(PROJECT_LIMITS.narrativeMax).default(""),
});

const listingIntentI18nSchema = z.object({
  fr: z.string().trim().max(PROJECT_LIMITS.listingIntentMax).default(""),
  en: z.string().trim().max(PROJECT_LIMITS.listingIntentMax).default(""),
  ar: z.string().trim().max(PROJECT_LIMITS.listingIntentMax).default(""),
});

const saleCtaLabelI18nSchema = z.object({
  fr: z.string().trim().max(PROJECT_LIMITS.saleCtaLabelMax).default(""),
  en: z.string().trim().max(PROJECT_LIMITS.saleCtaLabelMax).default(""),
  ar: z.string().trim().max(PROJECT_LIMITS.saleCtaLabelMax).default(""),
});

const saleCtaChannelsSchema = z
  .array(z.enum(SALE_CTA_CHANNELS))
  .max(SALE_CTA_CHANNELS.length)
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "duplicate_sale_cta_channel"
  );

export const projectI18nSchema = z.object({
  fr: localeString(PROJECT_LIMITS.titleMin, PROJECT_LIMITS.titleMax),
  en: localeString(PROJECT_LIMITS.titleMin, PROJECT_LIMITS.titleMax),
  ar: localeString(PROJECT_LIMITS.titleMin, PROJECT_LIMITS.titleMax),
});

export const projectDescriptionI18nSchema = z.object({
  fr: localeString(PROJECT_LIMITS.descriptionMin, PROJECT_LIMITS.descriptionMax),
  en: localeString(PROJECT_LIMITS.descriptionMin, PROJECT_LIMITS.descriptionMax),
  ar: localeString(PROJECT_LIMITS.descriptionMin, PROJECT_LIMITS.descriptionMax),
});

const optionalLabelI18n = z
  .object({
    fr: z.string().trim().max(PROJECT_LIMITS.imageLabelMax).optional(),
    en: z.string().trim().max(PROJECT_LIMITS.imageLabelMax).optional(),
    ar: z.string().trim().max(PROJECT_LIMITS.imageLabelMax).optional(),
  })
  .optional();

function isAllowedImageUrl(url: string): boolean {
  if (!isSafeHttpUrl(url)) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname;
    return (
      host.endsWith(".supabase.co") ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

export const projectImageSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .refine(isAllowedImageUrl, "invalid_image_url"),
  label: optionalLabelI18n,
});

const featureItemSchema = z.object({
  fr: z.string().trim().min(1).max(PROJECT_LIMITS.featureMax),
  en: z.string().trim().max(PROJECT_LIMITS.featureMax).default(""),
  ar: z.string().trim().max(PROJECT_LIMITS.featureMax).default(""),
});

const technologySchema = z
  .string()
  .trim()
  .min(1)
  .max(PROJECT_LIMITS.technologyMax);

/** Champ write optionnel : absent → null sans forcer la clé dans les patches. */
const coverImageWriteSchema = z
  .union([z.string().trim().max(1000), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    return v;
  })
  .refine((v) => v === null || isAllowedImageUrl(v), "invalid_image_url");

const seoTitleI18nSchema = z.object({
  fr: z.string().trim().max(PROJECT_LIMITS.seoTitleMax).default(""),
  en: z.string().trim().max(PROJECT_LIMITS.seoTitleMax).default(""),
  ar: z.string().trim().max(PROJECT_LIMITS.seoTitleMax).default(""),
});

const seoDescriptionI18nSchema = z.object({
  fr: z.string().trim().max(PROJECT_LIMITS.seoDescriptionMax).default(""),
  en: z.string().trim().max(PROJECT_LIMITS.seoDescriptionMax).default(""),
  ar: z.string().trim().max(PROJECT_LIMITS.seoDescriptionMax).default(""),
});

export const projectWriteSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(PROJECT_LIMITS.slugMin)
      .max(PROJECT_LIMITS.slugMax)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid_slug"),
    title: projectI18nSchema,
    description: projectDescriptionI18nSchema,
    kind: z.enum(PROJECT_KINDS),
    listingPriceCents: z
      .number()
      .int()
      .min(0)
      .max(PROJECT_LIMITS.listingPriceCentsMax)
      .nullable()
      .optional()
      .transform((v) => (v === undefined ? null : v)),
    listingIntent: listingIntentI18nSchema.default({ fr: "", en: "", ar: "" }),
    saleCtaMode: z.enum(SALE_CTA_MODES).default("contacts"),
    saleCtaLabel: saleCtaLabelI18nSchema.default({ fr: "", en: "", ar: "" }),
    saleCtaChannels: saleCtaChannelsSchema.default([]),
    businessTypeIds: z
      .array(z.string())
      .max(PROJECT_LIMITS.maxBusinessTypes)
      .refine((ids) => ids.every(isProjectBusinessTypeId), "invalid_business_type")
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "duplicate_business_type"
      ),
    images: z
      .array(projectImageSchema)
      .max(PROJECT_LIMITS.maxImages),
    link: z
      .string()
      .trim()
      .max(PROJECT_LIMITS.linkMax)
      .nullable()
      .optional()
      .transform((v) => {
        if (v === undefined || v === null || v === "") return null;
        return v;
      })
      .refine((v) => v === null || isSafeHttpUrl(v), "invalid_link"),
    appLink: z
      .string()
      .trim()
      .max(PROJECT_LIMITS.linkMax)
      .nullable()
      .optional()
      .transform((v) => {
        if (v === undefined || v === null || v === "") return null;
        return v;
      })
      .refine((v) => v === null || isSafeHttpUrl(v), "invalid_app_link"),
    sortOrder: z
      .number()
      .int()
      .min(PROJECT_LIMITS.sortOrderMin)
      .max(PROJECT_LIMITS.sortOrderMax),
    published: z.boolean(),
    featured: z.boolean().default(false),
    coverImage: coverImageWriteSchema,
    technologies: z
      .array(technologySchema)
      .max(PROJECT_LIMITS.maxTechnologies)
      .default([]),
    features: z
      .array(featureItemSchema)
      .max(PROJECT_LIMITS.maxFeatures)
      .default([]),
    clientNeed: projectOptionalI18nSchema.default({ fr: "", en: "", ar: "" }),
    objective: projectOptionalI18nSchema.default({ fr: "", en: "", ar: "" }),
    solution: projectOptionalI18nSchema.default({ fr: "", en: "", ar: "" }),
    result: projectOptionalI18nSchema.default({ fr: "", en: "", ar: "" }),
    seoTitle: seoTitleI18nSchema.default({ fr: "", en: "", ar: "" }),
    seoDescription: seoDescriptionI18nSchema.default({
      fr: "",
      en: "",
      ar: "",
    }),
    /** Optionnel : fourni par le serveur si omis. */
    reference: z
      .string()
      .trim()
      .max(PROJECT_LIMITS.referenceMax)
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.published) return;
    if (!data.title.fr?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_title",
        path: ["title", "fr"],
      });
    }
    if (!data.description.fr?.trim() || data.description.fr.trim().length < 10) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_description",
        path: ["description", "fr"],
      });
    }
    if (!data.images.length) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_images",
        path: ["images"],
      });
    }
    if (data.kind === "for_sale" || data.kind === "sold") {
      if (data.listingPriceCents === null || data.listingPriceCents === undefined) {
        ctx.addIssue({
          code: "custom",
          message:
            data.kind === "sold"
              ? "publish_requires_sold_price"
              : "publish_requires_listing_price",
          path: ["listingPriceCents"],
        });
      }
      if (!data.listingIntent?.fr?.trim()) {
        ctx.addIssue({
          code: "custom",
          message:
            data.kind === "sold"
              ? "publish_requires_sold_work"
              : "publish_requires_listing_intent",
          path: ["listingIntent", "fr"],
        });
      }
    }
  });

export type ProjectWriteInput = z.infer<typeof projectWriteSchema>;

/** Patch : pas de defaults (évite un `{}` qui peuplerait sortOrder/published). */
export const projectPatchSchema = z
  .object({
    slug: projectWriteSchema.shape.slug.optional(),
    title: projectWriteSchema.shape.title.optional(),
    description: projectWriteSchema.shape.description.optional(),
    kind: projectWriteSchema.shape.kind.optional(),
    listingPriceCents: z
      .number()
      .int()
      .min(0)
      .max(PROJECT_LIMITS.listingPriceCentsMax)
      .nullable()
      .optional(),
    listingIntent: listingIntentI18nSchema.optional(),
    saleCtaMode: z.enum(SALE_CTA_MODES).optional(),
    saleCtaLabel: saleCtaLabelI18nSchema.optional(),
    saleCtaChannels: saleCtaChannelsSchema.optional(),
    businessTypeIds: projectWriteSchema.shape.businessTypeIds.optional(),
    images: projectWriteSchema.shape.images.optional(),
    link: projectWriteSchema.shape.link.optional(),
    appLink: projectWriteSchema.shape.appLink.optional(),
    sortOrder: projectWriteSchema.shape.sortOrder.optional(),
    published: projectWriteSchema.shape.published.optional(),
    featured: z.boolean().optional(),
    // Pas de transform undefined→null : sinon `{}` peuplerait coverImage.
    coverImage: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional()
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null || v === "") return null;
        return v;
      })
      .refine(
        (v) => v === undefined || v === null || isAllowedImageUrl(v),
        "invalid_image_url"
      ),
    technologies: z
      .array(technologySchema)
      .max(PROJECT_LIMITS.maxTechnologies)
      .optional(),
    features: z
      .array(featureItemSchema)
      .max(PROJECT_LIMITS.maxFeatures)
      .optional(),
    clientNeed: projectOptionalI18nSchema.optional(),
    objective: projectOptionalI18nSchema.optional(),
    solution: projectOptionalI18nSchema.optional(),
    result: projectOptionalI18nSchema.optional(),
    seoTitle: seoTitleI18nSchema.optional(),
    seoDescription: seoDescriptionI18nSchema.optional(),
    reference: z
      .string()
      .trim()
      .max(PROJECT_LIMITS.referenceMax)
      .nullable()
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.published !== true) return;
    // Publication via patch : exiger images si fournies, sinon laissé au store merge.
    if (data.images !== undefined && data.images.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_images",
        path: ["images"],
      });
    }
    if (data.title !== undefined && !data.title.fr?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_title",
        path: ["title", "fr"],
      });
    }
  });

export type ProjectPatchInput = Partial<z.infer<typeof projectPatchSchema>>;

function mapProjectZodError(issues: z.core.$ZodIssue[]): string {
  const issue = issues[0];
  if (!issue) return "invalid_request";
  const path = issue.path.map(String).join(".");
  const msg = issue.message;

  if (msg === "publish_requires_title") return "publish_requires_title";
  if (msg === "publish_requires_description") return "publish_requires_description";
  if (msg === "publish_requires_images") return "publish_requires_images";
  if (msg === "publish_requires_listing_price") return "publish_requires_listing_price";
  if (msg === "publish_requires_listing_intent") {
    return "publish_requires_listing_intent";
  }
  if (msg === "publish_requires_sold_price") return "publish_requires_sold_price";
  if (msg === "publish_requires_sold_work") return "publish_requires_sold_work";
  if (msg === "invalid_slug" || path === "slug") return "project_invalid_slug";
  if (msg === "invalid_business_type" || msg === "duplicate_business_type") {
    return msg;
  }
  if (
    path === "businessTypeIds" &&
    (issue.code === "too_big" || /too big|at most|max/i.test(msg))
  ) {
    return "project_too_many_business_types";
  }
  if (msg === "invalid_image_url") return "project_invalid_image";
  if (msg === "invalid_link") return "project_invalid_link";
  if (msg === "invalid_app_link") return "project_invalid_app_link";
  if (path.startsWith("title")) return "project_invalid_title";
  if (path.startsWith("description")) return "project_invalid_description";
  if (path.startsWith("images") || path.startsWith("coverImage")) {
    return "project_invalid_images";
  }
  if (path.startsWith("features")) return "project_invalid_features";
  if (path.startsWith("technologies")) return "project_invalid_technologies";
  if (
    path.startsWith("listingIntent") ||
    path.startsWith("saleCtaLabel") ||
    path === "listingPriceCents" ||
    path === "saleCtaMode" ||
    path === "saleCtaChannels" ||
    msg === "duplicate_sale_cta_channel"
  ) {
    return "project_invalid_listing";
  }
  if (path === "businessTypeIds") return "project_invalid_business_types";
  return msg || "invalid_request";
}

export function parseProjectWriteBody(
  body: unknown
):
  | { ok: true; values: ProjectWriteInput }
  | { ok: false; error: string } {
  const parsed = projectWriteSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: mapProjectZodError(parsed.error.issues),
    };
  }
  return { ok: true, values: parsed.data };
}

export function parseProjectPatchBody(
  body: unknown
):
  | { ok: true; values: ProjectPatchInput }
  | { ok: false; error: string } {
  if (
    body === null ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return { ok: false, error: "empty_patch" };
  }
  const parsed = projectPatchSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: mapProjectZodError(parsed.error.issues),
    };
  }
  const values = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  ) as ProjectPatchInput;
  if (Object.keys(values).length === 0) {
    return { ok: false, error: "empty_patch" };
  }
  return { ok: true, values };
}

export function isValidProjectKind(value: unknown): value is ProjectKind {
  return (
    typeof value === "string" &&
    (PROJECT_KINDS as readonly string[]).includes(value)
  );
}

/** Formate VZ—CASE 001 */
export function formatCaseReference(n: number): string {
  const safe = Math.max(1, Math.min(9999, Math.floor(n)));
  return `VZ—CASE ${String(safe).padStart(3, "0")}`;
}

export function parseCaseReferenceNumber(ref: string | null | undefined): number | null {
  if (!ref) return null;
  const m = ref.match(/VZ[—-]CASE\s*(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

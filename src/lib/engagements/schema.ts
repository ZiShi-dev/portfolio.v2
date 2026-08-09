import { z } from "zod";

export const ENGAGEMENT_LIMITS = {
  maxBodyBytes: 40_000,
  referenceMin: 2,
  referenceMax: 32,
  iconMin: 1,
  iconMax: 48,
  titleMin: 2,
  titleMax: 160,
  descriptionMax: 800,
  sortOrderMin: -9999,
  sortOrderMax: 9999,
} as const;

export const ENGAGEMENT_STATUSES = ["draft", "published", "archived"] as const;
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];

export const ENGAGEMENT_LOCALES = ["fr", "en", "ar"] as const;
export type EngagementLocale = (typeof ENGAGEMENT_LOCALES)[number];

const localeOptional = (max: number) =>
  z.object({
    fr: z.string().trim().max(max).default(""),
    en: z.string().trim().max(max).default(""),
    ar: z.string().trim().max(max).default(""),
  });

const uuidSchema = z.string().trim().uuid("invalid_uuid");

export const engagementWriteSchema = z
  .object({
    reference: z
      .string()
      .trim()
      .min(ENGAGEMENT_LIMITS.referenceMin)
      .max(ENGAGEMENT_LIMITS.referenceMax),
    icon: z
      .string()
      .trim()
      .min(ENGAGEMENT_LIMITS.iconMin)
      .max(ENGAGEMENT_LIMITS.iconMax)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid_icon"),
    status: z.enum(ENGAGEMENT_STATUSES),
    sortOrder: z
      .number()
      .int()
      .min(ENGAGEMENT_LIMITS.sortOrderMin)
      .max(ENGAGEMENT_LIMITS.sortOrderMax),
    title: localeOptional(ENGAGEMENT_LIMITS.titleMax),
    description: localeOptional(ENGAGEMENT_LIMITS.descriptionMax),
  })
  .superRefine((data, ctx) => {
    if (data.status !== "published") return;
    if (
      !data.title.fr?.trim() ||
      data.title.fr.trim().length < ENGAGEMENT_LIMITS.titleMin
    ) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_title",
        path: ["title", "fr"],
      });
    }
    if (!data.description.fr?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_description",
        path: ["description", "fr"],
      });
    }
  });

export type EngagementWriteInput = z.infer<typeof engagementWriteSchema>;

export const engagementPatchSchema = z
  .object({
    reference: engagementWriteSchema.shape.reference.optional(),
    icon: engagementWriteSchema.shape.icon.optional(),
    status: engagementWriteSchema.shape.status.optional(),
    sortOrder: engagementWriteSchema.shape.sortOrder.optional(),
    title: engagementWriteSchema.shape.title.optional(),
    description: engagementWriteSchema.shape.description.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.status === "published") {
      if (data.title !== undefined && !data.title.fr?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "publish_requires_title",
          path: ["title", "fr"],
        });
      }
      if (data.description !== undefined && !data.description.fr?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "publish_requires_description",
          path: ["description", "fr"],
        });
      }
    }
  });

export type EngagementPatchInput = Partial<
  z.infer<typeof engagementPatchSchema>
>;

export const engagementReorderSchema = z.object({
  orderedIds: z
    .array(uuidSchema)
    .min(1)
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length, "duplicate_id"),
});

export type EngagementReorderInput = z.infer<typeof engagementReorderSchema>;

function mapEngagementZodError(issues: z.core.$ZodIssue[]): string {
  const issue = issues[0];
  if (!issue) return "invalid_request";
  const path = issue.path.map(String).join(".");
  const msg = issue.message;

  if (msg === "publish_requires_title") return "publish_requires_title";
  if (msg === "publish_requires_description") {
    return "publish_requires_description";
  }
  if (msg === "invalid_icon" || path === "icon") {
    return "engagement_invalid_icon";
  }
  if (path === "reference") return "engagement_invalid_reference";
  if (path.startsWith("title")) return "engagement_invalid_title";
  if (path.startsWith("description")) return "engagement_invalid_description";
  if (msg === "duplicate_id") return "duplicate_id";
  return "invalid_request";
}

export function parseEngagementWriteBody(
  body: unknown
):
  | { ok: true; values: EngagementWriteInput }
  | { ok: false; error: string } {
  const parsed = engagementWriteSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: mapEngagementZodError(parsed.error.issues) };
  }
  return { ok: true, values: parsed.data };
}

export function parseEngagementPatchBody(
  body: unknown
):
  | { ok: true; values: EngagementPatchInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "invalid_request" };
  }
  const keys = Object.keys(body as object).filter((k) => k !== "action");
  if (keys.length === 0) return { ok: false, error: "empty_patch" };

  const parsed = engagementPatchSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: mapEngagementZodError(parsed.error.issues) };
  }
  return { ok: true, values: parsed.data };
}

export function parseEngagementReorderBody(
  body: unknown
):
  | { ok: true; values: EngagementReorderInput }
  | { ok: false; error: string } {
  const parsed = engagementReorderSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: mapEngagementZodError(parsed.error.issues) };
  }
  return { ok: true, values: parsed.data };
}

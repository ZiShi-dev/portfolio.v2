import { z } from "zod";

export const FAQ_LIMITS = {
  maxBodyBytes: 80_000,
  referenceMin: 2,
  referenceMax: 32,
  questionMin: 2,
  questionMax: 280,
  answerMax: 4000,
  sortOrderMin: -9999,
  sortOrderMax: 9999,
  maxServices: 24,
} as const;

export const FAQ_STATUSES = ["draft", "published", "archived"] as const;
export type FaqStatus = (typeof FAQ_STATUSES)[number];

export const FAQ_SCOPES = ["general", "service"] as const;
export type FaqScope = (typeof FAQ_SCOPES)[number];

export const FAQ_LOCALES = ["fr", "en", "ar"] as const;
export type FaqLocale = (typeof FAQ_LOCALES)[number];

const localeOptional = (max: number) =>
  z.object({
    fr: z.string().trim().max(max).default(""),
    en: z.string().trim().max(max).default(""),
    ar: z.string().trim().max(max).default(""),
  });

const uuidSchema = z.string().trim().uuid("invalid_uuid");

export const faqWriteSchema = z
  .object({
    reference: z
      .string()
      .trim()
      .min(FAQ_LIMITS.referenceMin)
      .max(FAQ_LIMITS.referenceMax),
    status: z.enum(FAQ_STATUSES),
    featured: z.boolean().default(false),
    sortOrder: z
      .number()
      .int()
      .min(FAQ_LIMITS.sortOrderMin)
      .max(FAQ_LIMITS.sortOrderMax),
    scope: z.enum(FAQ_SCOPES).default("general"),
    question: localeOptional(FAQ_LIMITS.questionMax),
    answer: localeOptional(FAQ_LIMITS.answerMax),
    serviceIds: z
      .array(uuidSchema)
      .max(FAQ_LIMITS.maxServices)
      .default([])
      .refine((ids) => new Set(ids).size === ids.length, "duplicate_service"),
  })
  .superRefine((data, ctx) => {
    if (data.status !== "published") return;
    if (
      !data.question.fr?.trim() ||
      data.question.fr.trim().length < FAQ_LIMITS.questionMin
    ) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_question",
        path: ["question", "fr"],
      });
    }
    if (!data.answer.fr?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "publish_requires_answer",
        path: ["answer", "fr"],
      });
    }
  });

export type FaqWriteInput = z.infer<typeof faqWriteSchema>;

export const faqPatchSchema = z
  .object({
    reference: z
      .string()
      .trim()
      .min(FAQ_LIMITS.referenceMin)
      .max(FAQ_LIMITS.referenceMax)
      .optional(),
    status: z.enum(FAQ_STATUSES).optional(),
    featured: z.boolean().optional(),
    sortOrder: z
      .number()
      .int()
      .min(FAQ_LIMITS.sortOrderMin)
      .max(FAQ_LIMITS.sortOrderMax)
      .optional(),
    scope: z.enum(FAQ_SCOPES).optional(),
    question: localeOptional(FAQ_LIMITS.questionMax).optional(),
    answer: localeOptional(FAQ_LIMITS.answerMax).optional(),
    serviceIds: z
      .array(uuidSchema)
      .max(FAQ_LIMITS.maxServices)
      .optional()
      .refine(
        (ids) => ids === undefined || new Set(ids).size === ids.length,
        "duplicate_service"
      ),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.status === "published") {
      if (data.question !== undefined && !data.question.fr?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "publish_requires_question",
          path: ["question", "fr"],
        });
      }
      if (data.answer !== undefined && !data.answer.fr?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "publish_requires_answer",
          path: ["answer", "fr"],
        });
      }
    }
  });

export type FaqPatchInput = Partial<z.infer<typeof faqPatchSchema>>;

export const faqReorderSchema = z.object({
  orderedIds: z
    .array(uuidSchema)
    .min(1)
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length, "duplicate_id"),
});

export type FaqReorderInput = z.infer<typeof faqReorderSchema>;

function mapFaqZodError(issues: z.core.$ZodIssue[]): string {
  const issue = issues[0];
  if (!issue) return "invalid_request";
  const msg = String(issue.message ?? "");
  if (msg === "publish_requires_question") return msg;
  if (msg === "publish_requires_answer") return msg;
  if (msg === "duplicate_service") return msg;
  if (msg === "duplicate_id") return msg;
  if (msg === "invalid_uuid") return msg;
  const path = issue.path?.join(".") ?? "";
  if (path.startsWith("reference")) return "invalid_reference";
  if (path.startsWith("question")) return "invalid_question";
  if (path.startsWith("answer")) return "invalid_answer";
  if (path.startsWith("serviceIds")) return "invalid_services";
  return "invalid_request";
}

export function parseFaqWriteBody(
  body: unknown
): { ok: true; values: FaqWriteInput } | { ok: false; error: string } {
  const parsed = faqWriteSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: mapFaqZodError(parsed.error.issues) };
  }
  return { ok: true, values: parsed.data };
}

export function parseFaqPatchBody(
  body: unknown
): { ok: true; values: FaqPatchInput } | { ok: false; error: string } {
  const parsed = faqPatchSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return { ok: false, error: mapFaqZodError(parsed.error.issues) };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "empty_patch" };
  }
  return { ok: true, values: parsed.data };
}

export function parseFaqReorderBody(
  body: unknown
): { ok: true; values: FaqReorderInput } | { ok: false; error: string } {
  const parsed = faqReorderSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: mapFaqZodError(parsed.error.issues) };
  }
  return { ok: true, values: parsed.data };
}

import { z } from "zod";
import {
  PROJECT_INQUIRY_BUDGETS,
  PROJECT_INQUIRY_CUSTOM_BUDGET,
  PROJECT_INQUIRY_OBJECTIVES,
  PROJECT_INQUIRY_OTHER_TEXT,
  PROJECT_INQUIRY_TIMELINES,
  PROJECT_INQUIRY_TYPES,
  PROJECT_INQUIRY_STATUSES,
  type ProjectInquiryBudget,
  type ProjectInquiryObjective,
  type ProjectInquiryStatus,
  type ProjectInquiryTimeline,
  type ProjectInquiryType,
} from "@/data/project-inquiry-options";
import {
  isHoneypotTriggered,
  isValidEmail,
  normalizeEmail,
  sanitizePersonName,
  sanitizeText,
} from "@/lib/form-validation";
import { isSafeHttpUrl } from "@/lib/review-schema";
import { ValidationErrors } from "@/lib/validation-errors";

export const PROJECT_INQUIRY_LIMITS = {
  maxBodyBytes: 48_000,
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  phoneMin: 6,
  phoneMax: 40,
  companyMax: 120,
  websiteMax: 500,
  descriptionMin: 10,
  descriptionMax: 5000,
  adminNotesMax: 4000,
  sourceMax: 80,
  referenceMax: 32,
  serviceReferenceMax: 32,
  otherTextMin: PROJECT_INQUIRY_OTHER_TEXT.min,
  otherTextMax: PROJECT_INQUIRY_OTHER_TEXT.max,
} as const;

const optionalOtherText = z
  .string()
  .trim()
  .max(PROJECT_INQUIRY_LIMITS.otherTextMax)
  .nullable()
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    return v;
  });

const optionalPhone = z
  .string()
  .trim()
  .max(PROJECT_INQUIRY_LIMITS.phoneMax)
  .nullable()
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    return v;
  })
  .refine(
    (v) =>
      v === null ||
      (v.length >= PROJECT_INQUIRY_LIMITS.phoneMin &&
        /^[+0-9()\s.-]+$/.test(v)),
    "invalid_phone"
  );

const optionalWebsite = z
  .string()
  .trim()
  .max(PROJECT_INQUIRY_LIMITS.websiteMax)
  .nullable()
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    return v;
  })
  .refine((v) => v === null || isSafeHttpUrl(v), "invalid_website");

export const projectInquiryWriteSchema = z
  .object({
    projectType: z.enum(PROJECT_INQUIRY_TYPES),
    projectTypeOther: optionalOtherText,
    objective: z.enum(PROJECT_INQUIRY_OBJECTIVES),
    objectiveOther: optionalOtherText,
    budgetRange: z.enum(PROJECT_INQUIRY_BUDGETS),
    budgetCustomAmount: z
      .number()
      .int()
      .min(PROJECT_INQUIRY_CUSTOM_BUDGET.min)
      .max(PROJECT_INQUIRY_CUSTOM_BUDGET.max)
      .nullable()
      .optional()
      .transform((v) => (v === undefined ? null : v)),
    timeline: z
      .enum(PROJECT_INQUIRY_TIMELINES)
      .nullable()
      .optional()
      .transform((v) => (v === undefined ? null : v)),
    targetLaunchDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "invalid_date")
      .nullable()
      .optional()
      .transform((v) => (v === undefined || v === null || v === "" ? null : v)),
    description: z
      .string()
      .trim()
      .min(PROJECT_INQUIRY_LIMITS.descriptionMin)
      .max(PROJECT_INQUIRY_LIMITS.descriptionMax),
    name: z
      .string()
      .trim()
      .min(PROJECT_INQUIRY_LIMITS.nameMin)
      .max(PROJECT_INQUIRY_LIMITS.nameMax),
    email: z.string().trim().email().max(PROJECT_INQUIRY_LIMITS.emailMax),
    phone: optionalPhone,
    whatsapp: optionalPhone,
    company: z
      .string()
      .trim()
      .max(PROJECT_INQUIRY_LIMITS.companyMax)
      .nullable()
      .optional()
      .transform((v) => (v === undefined || v === null || v === "" ? null : v)),
    currentWebsite: optionalWebsite,
    locale: z.enum(["fr", "en", "ar"]).default("fr"),
    source: z
      .string()
      .trim()
      .max(PROJECT_INQUIRY_LIMITS.sourceMax)
      .nullable()
      .optional()
      .transform((v) => (v === undefined || v === null || v === "" ? null : v)),
    serviceId: z
      .string()
      .trim()
      .uuid()
      .nullable()
      .optional()
      .transform((v) => (v === undefined || v === null || v === "" ? null : v)),
    serviceReference: z
      .string()
      .trim()
      .max(PROJECT_INQUIRY_LIMITS.serviceReferenceMax)
      .nullable()
      .optional()
      .transform((v) => (v === undefined || v === null || v === "" ? null : v)),
  })
  .superRefine((data, ctx) => {
    if (data.projectType === "other") {
      if (
        !data.projectTypeOther ||
        data.projectTypeOther.length < PROJECT_INQUIRY_LIMITS.otherTextMin
      ) {
        ctx.addIssue({
          code: "custom",
          message: "other_type_required",
          path: ["projectTypeOther"],
        });
      }
    }
    if (data.objective === "other") {
      if (
        !data.objectiveOther ||
        data.objectiveOther.length < PROJECT_INQUIRY_LIMITS.otherTextMin
      ) {
        ctx.addIssue({
          code: "custom",
          message: "other_objective_required",
          path: ["objectiveOther"],
        });
      }
    }
    if (data.budgetRange === "custom") {
      if (
        data.budgetCustomAmount === null ||
        data.budgetCustomAmount === undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message: "custom_budget_required",
          path: ["budgetCustomAmount"],
        });
      }
    }
    if (!data.timeline && !data.targetLaunchDate) {
      ctx.addIssue({
        code: "custom",
        message: "timeline_or_date_required",
        path: ["timeline"],
      });
    }
  });

export type ProjectInquiryWriteInput = z.infer<typeof projectInquiryWriteSchema>;

export type ProjectInquiryPayload = {
  projectType: ProjectInquiryType;
  projectTypeOther: string | null;
  objective: ProjectInquiryObjective;
  objectiveOther: string | null;
  budgetRange: ProjectInquiryBudget;
  budgetCustomAmount: number | null;
  timeline: ProjectInquiryTimeline;
  targetLaunchDate: string | null;
  description: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  currentWebsite: string | null;
  locale: "fr" | "en" | "ar";
  source: string | null;
  serviceId: string | null;
  serviceReference: string | null;
};

export const projectInquiryAdminPatchSchema = z
  .object({
    status: z.enum(PROJECT_INQUIRY_STATUSES).optional(),
    adminNotes: z
      .string()
      .trim()
      .max(PROJECT_INQUIRY_LIMITS.adminNotesMax)
      .nullable()
      .optional(),
  })
  .strict()
  .refine((v) => v.status !== undefined || v.adminNotes !== undefined, {
    message: "empty_patch",
  });

export type ProjectInquiryAdminPatch = z.infer<
  typeof projectInquiryAdminPatchSchema
>;

function mapZodError(issues: z.core.$ZodIssue[]): {
  error: string;
  field?: string;
} {
  const issue = issues[0];
  if (!issue) return { error: ValidationErrors.invalidRequest };
  const path = issue.path.map(String).join(".");
  const msg = issue.message;

  if (path === "name") return { error: ValidationErrors.nameTooShort, field: "name" };
  if (path === "email") return { error: ValidationErrors.emailInvalid, field: "email" };
  if (path === "description") {
    return { error: ValidationErrors.messageTooShortMin, field: "description" };
  }
  if (msg === "invalid_phone" || path === "phone" || path === "whatsapp") {
    return { error: ValidationErrors.invalidPhone, field: path || "phone" };
  }
  if (msg === "invalid_website" || path === "currentWebsite") {
    return { error: ValidationErrors.invalidRequest, field: "currentWebsite" };
  }
  if (msg === "custom_budget_required" || path === "budgetCustomAmount") {
    return {
      error: ValidationErrors.invalidRequest,
      field: "budgetCustomAmount",
    };
  }
  if (msg === "other_type_required" || path === "projectTypeOther") {
    return {
      error: ValidationErrors.invalidRequest,
      field: "projectTypeOther",
    };
  }
  if (msg === "other_objective_required" || path === "objectiveOther") {
    return {
      error: ValidationErrors.invalidRequest,
      field: "objectiveOther",
    };
  }
  if (msg === "timeline_or_date_required" || path === "timeline") {
    return { error: ValidationErrors.invalidRequest, field: "timeline" };
  }
  if (msg === "empty_patch") return { error: "empty_patch" };
  return { error: ValidationErrors.invalidRequest, field: path || undefined };
}

function coerceBudgetCustomAmount(raw: unknown): number | null | unknown {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? Math.round(raw) : raw;
  }
  if (typeof raw === "string") {
    const cleaned = raw.replace(/\s/g, "").replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? Math.round(n) : raw;
  }
  return raw;
}

export function parseProjectInquiryPayload(
  body: unknown
):
  | { ok: true; data: ProjectInquiryPayload }
  | { ok: false; error: string; field?: string }
  | { ok: false; error: "honeypot" } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: ValidationErrors.invalidRequest };
  }

  const raw = body as Record<string, unknown>;
  if (
    isHoneypotTriggered(
      typeof raw._honeypot === "string" ? raw._honeypot : ""
    )
  ) {
    return { ok: false, error: "honeypot" };
  }

  const normalized = {
    ...raw,
    budgetCustomAmount: coerceBudgetCustomAmount(raw.budgetCustomAmount),
    projectTypeOther:
      typeof raw.projectTypeOther === "string"
        ? sanitizeText(raw.projectTypeOther, PROJECT_INQUIRY_LIMITS.otherTextMax)
        : raw.projectTypeOther,
    objectiveOther:
      typeof raw.objectiveOther === "string"
        ? sanitizeText(raw.objectiveOther, PROJECT_INQUIRY_LIMITS.otherTextMax)
        : raw.objectiveOther,
    name: sanitizePersonName(
      typeof raw.name === "string" ? raw.name : "",
      PROJECT_INQUIRY_LIMITS.nameMax
    ),
    email: normalizeEmail(
      sanitizeText(
        typeof raw.email === "string" ? raw.email : "",
        PROJECT_INQUIRY_LIMITS.emailMax
      )
    ),
    description: sanitizeText(
      typeof raw.description === "string" ? raw.description : "",
      PROJECT_INQUIRY_LIMITS.descriptionMax
    ),
    company:
      typeof raw.company === "string"
        ? sanitizeText(raw.company, PROJECT_INQUIRY_LIMITS.companyMax)
        : raw.company,
    phone:
      typeof raw.phone === "string"
        ? sanitizeText(raw.phone, PROJECT_INQUIRY_LIMITS.phoneMax)
        : raw.phone,
    whatsapp:
      typeof raw.whatsapp === "string"
        ? sanitizeText(raw.whatsapp, PROJECT_INQUIRY_LIMITS.phoneMax)
        : raw.whatsapp,
  };

  if (!isValidEmail(String(normalized.email ?? ""))) {
    return { ok: false, error: ValidationErrors.emailInvalid, field: "email" };
  }

  const parsed = projectInquiryWriteSchema.safeParse(normalized);
  if (!parsed.success) {
    return { ok: false, ...mapZodError(parsed.error.issues) };
  }

  return {
    ok: true,
    data: {
      ...parsed.data,
      projectTypeOther:
        parsed.data.projectType === "other"
          ? (parsed.data.projectTypeOther ?? null)
          : null,
      objectiveOther:
        parsed.data.objective === "other"
          ? (parsed.data.objectiveOther ?? null)
          : null,
      budgetCustomAmount:
        parsed.data.budgetRange === "custom"
          ? (parsed.data.budgetCustomAmount ?? null)
          : null,
      // DB exige un timeline ; si seule la date est fournie → unknown.
      timeline: parsed.data.timeline ?? "unknown",
      targetLaunchDate: parsed.data.targetLaunchDate ?? null,
      phone: parsed.data.phone ?? null,
      whatsapp: parsed.data.whatsapp ?? null,
      company: parsed.data.company ?? null,
      currentWebsite: parsed.data.currentWebsite ?? null,
      source: parsed.data.source ?? null,
      serviceId: parsed.data.serviceId ?? null,
      serviceReference: parsed.data.serviceReference ?? null,
    },
  };
}

export function parseProjectInquiryAdminPatch(
  body: unknown
):
  | { ok: true; values: ProjectInquiryAdminPatch }
  | { ok: false; error: string } {
  const parsed = projectInquiryAdminPatchSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: mapZodError(parsed.error.issues).error };
  }
  return { ok: true, values: parsed.data };
}

export function formatLeadReference(n: number): string {
  const safe = Math.max(1, Math.min(9999, Math.floor(n)));
  return `VZ—LEAD ${String(safe).padStart(3, "0")}`;
}

export function parseLeadReferenceNumber(
  ref: string | null | undefined
): number | null {
  if (!ref) return null;
  const m = ref.match(/VZ[—-]LEAD\s*(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function isProjectInquiryStatus(
  value: unknown
): value is ProjectInquiryStatus {
  return (
    typeof value === "string" &&
    (PROJECT_INQUIRY_STATUSES as readonly string[]).includes(value)
  );
}

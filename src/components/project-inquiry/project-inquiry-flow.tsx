"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { HoneypotField } from "@/components/ui/honeypot-field";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/turnstile-widget";
import { ChoiceCards } from "@/components/project-inquiry/choice-cards";
import {
  ProjectConstellation,
  constellationIndexForStep,
} from "@/components/project-inquiry/project-constellation";
import { PROJECT_INQUIRY_TYPE_ICONS } from "@/components/project-inquiry/project-inquiry-type-icons";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { routes } from "@/lib/routes";
import { resolveOfferInquiryProfile } from "@/data/project-inquiry-offer-profiles";
import {
  PROJECT_INQUIRY_BUDGETS,
  PROJECT_INQUIRY_CUSTOM_BUDGET,
  PROJECT_INQUIRY_OBJECTIVES,
  PROJECT_INQUIRY_OTHER_TEXT,
  PROJECT_INQUIRY_TEXT_LIMITS,
  PROJECT_INQUIRY_TIMELINES,
  PROJECT_INQUIRY_TYPES,
  type ProjectInquiryBudget,
  type ProjectInquiryObjective,
  type ProjectInquiryStep,
  type ProjectInquirySource,
  type ProjectInquiryTimeline,
  type ProjectInquiryType,
} from "@/data/project-inquiry-options";
import { useSubmitGuard } from "@/hooks/use-submit-guard";
import { cn } from "@/lib/utils";
import { isValidEmail } from "@/lib/form-validation";
import { isSafeHttpUrl } from "@/lib/review-schema";

const turnstileEnabled = Boolean(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
);

const PHONE_RE = /^[+0-9()\s.-]+$/;

type FieldKey =
  | "projectTypeOther"
  | "objectiveOther"
  | "budgetCustomAmount"
  | "description"
  | "name"
  | "email"
  | "whatsapp"
  | "currentWebsite"
  | "targetLaunchDate";

function isValidPhone(value: string): boolean {
  const v = value.trim();
  return v.length >= 6 && v.length <= 40 && PHONE_RE.test(v);
}

type Answers = {
  projectType: ProjectInquiryType | null;
  projectTypeOther: string;
  objective: ProjectInquiryObjective | null;
  objectiveOther: string;
  budgetRange: ProjectInquiryBudget | null;
  budgetCustomAmount: string;
  timeline: ProjectInquiryTimeline | null;
  targetLaunchDate: string;
  description: string;
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  currentWebsite: string;
};

const STORAGE_KEY = "vorzix_project_inquiry_draft_v2";
const LEGACY_STORAGE_KEY = "vorzix_project_inquiry_draft_v1";

const emptyAnswers = (): Answers => ({
  projectType: null,
  projectTypeOther: "",
  objective: null,
  objectiveOther: "",
  budgetRange: null,
  budgetCustomAmount: "",
  timeline: null,
  targetLaunchDate: "",
  description: "",
  name: "",
  email: "",
  whatsapp: "",
  company: "",
  currentWebsite: "",
});

function parseSafeDraft(value: unknown): Partial<Answers> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const draft = value as Record<string, unknown>;
  const safe: Partial<Answers> = {};

  if (
    typeof draft.projectType === "string" &&
    (PROJECT_INQUIRY_TYPES as readonly string[]).includes(draft.projectType)
  ) {
    safe.projectType = draft.projectType as ProjectInquiryType;
  }
  if (
    typeof draft.objective === "string" &&
    (PROJECT_INQUIRY_OBJECTIVES as readonly string[]).includes(draft.objective)
  ) {
    safe.objective = draft.objective as ProjectInquiryObjective;
  }
  if (
    typeof draft.budgetRange === "string" &&
    (PROJECT_INQUIRY_BUDGETS as readonly string[]).includes(draft.budgetRange)
  ) {
    safe.budgetRange = draft.budgetRange as ProjectInquiryBudget;
  }
  if (
    typeof draft.timeline === "string" &&
    (PROJECT_INQUIRY_TIMELINES as readonly string[]).includes(draft.timeline)
  ) {
    safe.timeline = draft.timeline as ProjectInquiryTimeline;
  }
  if (
    typeof draft.targetLaunchDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(draft.targetLaunchDate)
  ) {
    safe.targetLaunchDate = draft.targetLaunchDate;
  }

  return safe;
}

function draftAnswers(answers: Answers): Partial<Answers> {
  return {
    projectType: answers.projectType,
    objective: answers.objective,
    budgetRange: answers.budgetRange,
    timeline: answers.timeline,
    targetLaunchDate: answers.targetLaunchDate,
  };
}

function parseCustomBudgetInput(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function isValidOtherText(raw: string): boolean {
  const trimmed = raw.trim();
  return (
    trimmed.length >= PROJECT_INQUIRY_OTHER_TEXT.min &&
    trimmed.length <= PROJECT_INQUIRY_OTHER_TEXT.max
  );
}

function formatBudgetSummary(
  answers: Answers,
  label: (id: ProjectInquiryBudget) => string,
  customLabel: (amount: number) => string
): string {
  if (!answers.budgetRange) return "—";
  if (answers.budgetRange === "custom") {
    const amount = parseCustomBudgetInput(answers.budgetCustomAmount);
    return amount != null ? customLabel(amount) : label("custom");
  }
  return label(answers.budgetRange);
}

const BASE_QUESTION_STEPS: ProjectInquiryStep[] = [
  "type",
  "objective",
  "budget",
  "timeline",
  "description",
  "contact",
];

const OFFER_QUESTION_STEPS: ProjectInquiryStep[] = [
  "objective",
  "budget",
  "timeline",
  "description",
  "contact",
];

function questionStepsFor(lockType: boolean): ProjectInquiryStep[] {
  return lockType ? OFFER_QUESTION_STEPS : BASE_QUESTION_STEPS;
}

function applyOfferLock(
  answers: Answers,
  profile: ReturnType<typeof resolveOfferInquiryProfile>,
  offerTitle: string | null | undefined
): Answers {
  if (!profile) return answers;
  const next: Answers = { ...answers, projectType: profile.projectType };
  if (profile.projectType === "other") {
    const fallback = (offerTitle ?? "").trim().slice(
      0,
      PROJECT_INQUIRY_OTHER_TEXT.max
    );
    if (
      !next.projectTypeOther.trim() &&
      fallback.length >= PROJECT_INQUIRY_OTHER_TEXT.min
    ) {
      next.projectTypeOther = fallback;
    }
  } else {
    next.projectTypeOther = "";
  }
  if (next.objective && !profile.objectives.includes(next.objective)) {
    next.objective = null;
    next.objectiveOther = "";
  }
  return next;
}

function completedCountFromAnswers(
  answers: Answers,
  step: ProjectInquiryStep,
  lockType: boolean
): number {
  const flags = lockType
    ? [
        Boolean(answers.objective),
        Boolean(answers.budgetRange),
        Boolean(answers.timeline || answers.targetLaunchDate),
        answers.description.trim().length >= 10,
        answers.name.trim().length >= 2 && answers.email.includes("@"),
      ]
    : [
        Boolean(answers.projectType),
        Boolean(answers.objective),
        Boolean(answers.budgetRange),
        Boolean(answers.timeline || answers.targetLaunchDate),
        answers.description.trim().length >= 10,
        answers.name.trim().length >= 2 && answers.email.includes("@"),
      ];

  let n = 0;
  for (const done of flags) {
    if (!done) break;
    n += 1;
  }

  if (step === "intro") return 0;
  if (step === "summary" || step === "success") return flags.length;
  return n;
}

export function ProjectInquiryFlow({
  source,
  fullscreen = false,
  initialProjectType,
  serviceId,
  serviceReference,
  serviceSlug,
  serviceTitle,
  listingSlug,
  listingTitle,
}: {
  source?: ProjectInquirySource;
  fullscreen?: boolean;
  /** Pré-sélection depuis une offre ou `?type=` — verrouillée si une offre est en contexte. */
  initialProjectType?: ProjectInquiryType | null;
  serviceId?: string | null;
  serviceReference?: string | null;
  serviceSlug?: string | null;
  serviceTitle?: string | null;
  listingSlug?: string | null;
  listingTitle?: string | null;
}) {
  const t = useTranslations("projectInquiry");
  const tVal = useTranslations("validation");
  const locale = useLocale() as "fr" | "en" | "ar";
  const reduceMotion = useReducedMotion();
  const { loading, setLoading, trySubmit } = useSubmitGuard();

  const offerProfile = useMemo(() => {
    if (listingSlug) {
      return resolveOfferInquiryProfile(
        initialProjectType === "ecommerce" ? "ecommerce" : "sur-mesure",
        initialProjectType ?? "other"
      );
    }
    return resolveOfferInquiryProfile(serviceSlug, initialProjectType ?? null);
  }, [listingSlug, serviceSlug, initialProjectType]);
  const lockType = Boolean(
    (serviceSlug && offerProfile) || (listingSlug && offerProfile)
  );
  const questionSteps = useMemo(() => questionStepsFor(lockType), [lockType]);
  const firstQuestionStep = questionSteps[0] ?? "type";
  const offerCopySlug = offerProfile?.slug ?? null;

  const [step, setStep] = useState<ProjectInquiryStep>("intro");
  const [answers, setAnswers] = useState<Answers>(() => {
    const base = emptyAnswers();
    if (
      initialProjectType &&
      (PROJECT_INQUIRY_TYPES as readonly string[]).includes(initialProjectType)
    ) {
      base.projectType = initialProjectType;
    }
    const locked = applyOfferLock(
      base,
      listingSlug
        ? resolveOfferInquiryProfile(
            initialProjectType === "ecommerce" ? "ecommerce" : "sur-mesure",
            initialProjectType ?? "other"
          )
        : resolveOfferInquiryProfile(serviceSlug, initialProjectType ?? null),
      listingTitle ?? serviceTitle
    );
    if (listingTitle && !locked.description.trim()) {
      locked.description = t("listingPrefill", { title: listingTitle });
    }
    return locked;
  });
  const [transitioning, setTransitioning] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldKey, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef<ProjectInquiryStep>("intro");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const focusField = useCallback((id: string) => {
    window.requestAnimationFrame(() => document.getElementById(id)?.focus());
  }, []);

  const clearFieldError = useCallback((key: FieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setFieldErr = useCallback((key: FieldKey, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [key]: message }));
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  useEffect(() => {
    let restoredAnswers: Answers | null = null;
    try {
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { answers?: unknown };
        if (parsed.answers) {
          const merged = {
            ...emptyAnswers(),
            ...parseSafeDraft(parsed.answers),
          };
          if (!merged.projectType && initialProjectType) {
            merged.projectType = initialProjectType;
          }
          restoredAnswers = applyOfferLock(
            merged,
            listingSlug
              ? resolveOfferInquiryProfile(
                  initialProjectType === "ecommerce"
                    ? "ecommerce"
                    : "sur-mesure",
                  initialProjectType ?? "other"
                )
              : resolveOfferInquiryProfile(
                  serviceSlug,
                  initialProjectType ?? null
                ),
            listingTitle ?? serviceTitle
          );
        }
      }
    } catch {
      /* ignore */
    }
    const frame = window.requestAnimationFrame(() => {
      if (restoredAnswers) setAnswers(restoredAnswers);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
    // Intentionnel : hydratation unique au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated || step === "success") return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers: draftAnswers(answers) })
      );
    } catch {
      /* ignore */
    }
  }, [answers, step, hydrated]);

  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;
    const timer = window.setTimeout(() => {
      flowRef.current
        ?.querySelector<HTMLElement>("[data-step-heading]")
        ?.focus();
    }, reduceMotion ? 0 : 320);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, step]);

  const goNext = useCallback(
    (next: ProjectInquiryStep) => {
      if (transitioning) return;
      clearAllFieldErrors();
      setSubmitError(null);
      if (reduceMotion) {
        setStep(next);
        return;
      }
      setTransitioning(true);
      window.setTimeout(() => {
        setStep(next);
        setTransitioning(false);
      }, 380);
    },
    [clearAllFieldErrors, reduceMotion, transitioning]
  );

  const selectAndAdvance = useCallback(
    (
      patch: Partial<Answers>,
      next: ProjectInquiryStep
    ) => {
      if (transitioning || loading) return;
      setAnswers((prev) => ({ ...prev, ...patch }));
      goNext(next);
    },
    [goNext, loading, transitioning]
  );

  const currentIndex = constellationIndexForStep(step, questionSteps);
  const completed = completedCountFromAnswers(answers, step, lockType);

  const stepLabel = useMemo(() => {
    const qi = questionSteps.indexOf(step);
    if (qi < 0) return t("progress.overview");
    return t("progress.step", {
      current: qi + 1,
      total: questionSteps.length,
      label: t(`nodes.${questionSteps[qi]}`),
    });
  }, [questionSteps, step, t]);

  const typeOptions = PROJECT_INQUIRY_TYPES.map((id) => ({
    id,
    title: t(`types.${id}.title`),
    description: t(`types.${id}.description`),
    icon: PROJECT_INQUIRY_TYPE_ICONS[id],
  }));

  const objectiveIds = offerProfile?.objectives ?? PROJECT_INQUIRY_OBJECTIVES;

  const objectiveOptions = objectiveIds.map((id) => {
    const offerKey = offerCopySlug
      ? `offers.${offerCopySlug}.objectives.${id}`
      : null;
    return {
      id,
      title:
        offerKey && t.has(offerKey)
          ? t(offerKey)
          : t(`objectives.${id}`),
    };
  });

  const budgetOptions = PROJECT_INQUIRY_BUDGETS.map((id) => ({
    id,
    title: t(`budgets.${id}`),
    // Plages / montants € restent LTR en arabe ; labels texte suivent la locale.
    ...(id === "unknown" || id === "custom" ? {} : { titleDir: "ltr" as const }),
  }));

  const timelineOptions = PROJECT_INQUIRY_TIMELINES.map((id) => ({
    id,
    title: t(`timelines.${id}`),
  }));

  async function submit() {
    setSubmitError(null);
    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") {
        setSubmitError(tVal("cooldown"));
      }
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setSubmitError(t("errors.turnstile"));
      return;
    }
    if (
      answers.currentWebsite.trim() &&
      !isSafeHttpUrl(answers.currentWebsite.trim())
    ) {
      setFieldErr("currentWebsite", t("errors.invalidWebsite"));
      return;
    }
    if (answers.whatsapp.trim() && !isValidPhone(answers.whatsapp)) {
      setFieldErr("whatsapp", t("errors.invalidPhone"));
      return;
    }
    if (!answers.timeline && !answers.targetLaunchDate) {
      setSubmitError(t("errors.timelineOrDate"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/project-inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectType: answers.projectType,
          projectTypeOther:
            answers.projectType === "other"
              ? answers.projectTypeOther.trim()
              : null,
          objective: answers.objective,
          objectiveOther:
            answers.objective === "other"
              ? answers.objectiveOther.trim()
              : null,
          budgetRange: answers.budgetRange,
          budgetCustomAmount:
            answers.budgetRange === "custom"
              ? parseCustomBudgetInput(answers.budgetCustomAmount)
              : null,
          timeline: answers.timeline || null,
          targetLaunchDate: answers.targetLaunchDate || null,
          description: answers.description,
          name: answers.name,
          email: answers.email,
          phone: null,
          whatsapp: answers.whatsapp || null,
          company: answers.company || null,
          currentWebsite: answers.currentWebsite || null,
          locale,
          source: source ?? "site",
          serviceId: serviceId ?? null,
          serviceReference: serviceReference ?? null,
          turnstileToken: turnstileToken || undefined,
          _honeypot: honeypot,
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        field?: string;
        reference?: string;
      };

      if (!res.ok || !body.ok) {
        turnstileRef.current?.reset();
        if (res.status === 429) {
          setSubmitError(
            body.error === "dailyRateLimited"
              ? tVal("dailyRateLimited")
              : tVal("rateLimited")
          );
        } else if (body.error === "invalidPhone") {
          setStep("contact");
          setFieldErr(
            body.field === "phone" ? "whatsapp" : "whatsapp",
            t("errors.invalidPhone")
          );
        } else if (body.field === "objectiveOther") {
          setStep("objective");
          setFieldErr("objectiveOther", t("errors.otherText"));
        } else if (body.field === "projectTypeOther") {
          setStep(lockType ? "intro" : "type");
          setFieldErr("projectTypeOther", t("errors.otherText"));
        } else if (body.field === "currentWebsite") {
          setStep("contact");
          setFieldErr("currentWebsite", t("errors.invalidWebsite"));
        } else if (body.field === "timeline") {
          setStep("timeline");
          setSubmitError(t("errors.timelineOrDate"));
        } else if (body.field === "targetLaunchDate") {
          setStep("timeline");
          setFieldErr("targetLaunchDate", t("errors.invalidDate"));
        } else if (body.field === "description") {
          setStep("description");
          setFieldErr("description", t("errors.description"));
        } else if (body.field === "name") {
          setStep("contact");
          setFieldErr("name", tVal("nameTooShort"));
        } else if (body.field === "email") {
          setStep("contact");
          setFieldErr("email", tVal("emailInvalid"));
        } else {
          setSubmitError(t("errors.submit"));
        }
        return;
      }

      setReference(body.reference ?? null);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setStep("success");
    } catch {
      turnstileRef.current?.reset();
      setSubmitError(tVal("networkError"));
    } finally {
      setLoading(false);
    }
  }

  function renderQuestionBody() {
    switch (step) {
      case "intro": {
        const introTitle = listingTitle
          ? t("listing.introTitle", { title: listingTitle })
          : lockType && offerCopySlug
            ? t.has(`offers.${offerCopySlug}.introTitle`)
              ? t(`offers.${offerCopySlug}.introTitle`, {
                  offer: serviceTitle ?? "",
                })
              : t("offers.generic.introTitle", {
                  offer: serviceTitle ?? "",
                })
            : t("intro.title");
        const introSubtitle = listingTitle
          ? t("listing.introSubtitle")
          : lockType && offerCopySlug
            ? t.has(`offers.${offerCopySlug}.introSubtitle`)
              ? t(`offers.${offerCopySlug}.introSubtitle`)
              : t("offers.generic.introSubtitle")
            : t("intro.subtitle");
        return (
          <div className="space-y-6 text-center sm:text-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
              {serviceReference ?? t("brand")}
            </p>
            <h1
              data-step-heading
              tabIndex={-1}
              className="font-display text-3xl font-semibold tracking-tight text-foreground outline-none sm:text-4xl"
            >
              {introTitle}
            </h1>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:mx-0 sm:text-base">
              {introSubtitle}
            </p>
            <Button
              type="button"
              size="lg"
              className="min-h-12 w-full sm:w-auto"
              onClick={() => goNext(firstQuestionStep)}
            >
              {t("intro.cta")}
            </Button>
          </div>
        );
      }

      case "type":
        return (
          <StepShell title={t("questions.type")} hint={stepLabel}>
            <ChoiceCards
              name={t("questions.type")}
              options={typeOptions}
              value={answers.projectType}
              disabled={transitioning}
              onSelect={(id) => {
                const projectType = id as ProjectInquiryType;
                if (projectType === "other") {
                  if (transitioning || loading) return;
                  setAnswers((prev) => ({ ...prev, projectType }));
                  clearAllFieldErrors();
                  setSubmitError(null);
                  return;
                }
                selectAndAdvance(
                  { projectType, projectTypeOther: "" },
                  "objective"
                );
              }}
            />
            {answers.projectType === "other" ? (
              <div className="mt-6 space-y-4">
                <FormField
                  id="project-type-other"
                  label={t("fields.typeOther")}
                  error={fieldErrors.projectTypeOther}
                >
                  <Input
                    id="project-type-other"
                    value={answers.projectTypeOther}
                    maxLength={PROJECT_INQUIRY_OTHER_TEXT.max}
                    placeholder={t("fields.typeOtherPlaceholder")}
                    aria-invalid={Boolean(fieldErrors.projectTypeOther)}
                    aria-describedby={
                      fieldErrors.projectTypeOther
                        ? "project-type-other-error"
                        : undefined
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setAnswers((a) => ({ ...a, projectTypeOther: value }));
                      if (value.trim() && !isValidOtherText(value)) {
                        setFieldErr("projectTypeOther", t("errors.otherText"));
                      } else {
                        clearFieldError("projectTypeOther");
                      }
                    }}
                    onBlur={() => {
                      if (!isValidOtherText(answers.projectTypeOther)) {
                        setFieldErr("projectTypeOther", t("errors.otherText"));
                      }
                    }}
                  />
                </FormField>
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full sm:w-auto"
                  disabled={transitioning}
                  onClick={() => {
                    if (!isValidOtherText(answers.projectTypeOther)) {
                      setFieldErr("projectTypeOther", t("errors.otherText"));
                      return;
                    }
                    goNext("objective");
                  }}
                >
                  {t("nav.continue")}
                </Button>
              </div>
            ) : null}
          </StepShell>
        );

      case "objective": {
        const objectiveQuestion =
          lockType && offerCopySlug
            ? t.has(`offers.${offerCopySlug}.objectiveQuestion`)
              ? t(`offers.${offerCopySlug}.objectiveQuestion`)
              : t("offers.generic.objectiveQuestion")
            : t("questions.objective");
        return (
          <StepShell title={objectiveQuestion} hint={stepLabel}>
            <ChoiceCards
              name={objectiveQuestion}
              options={objectiveOptions}
              value={answers.objective}
              disabled={transitioning}
              onSelect={(id) => {
                const objective = id as ProjectInquiryObjective;
                if (objective === "other") {
                  if (transitioning || loading) return;
                  setAnswers((prev) => ({ ...prev, objective }));
                  clearAllFieldErrors();
                  setSubmitError(null);
                  return;
                }
                selectAndAdvance(
                  { objective, objectiveOther: "" },
                  "budget"
                );
              }}
            />
            {answers.objective === "other" ? (
              <div className="mt-6 space-y-4">
                <FormField
                  id="objective-other"
                  label={t("fields.objectiveOther")}
                  error={fieldErrors.objectiveOther}
                >
                  <Input
                    id="objective-other"
                    value={answers.objectiveOther}
                    maxLength={PROJECT_INQUIRY_OTHER_TEXT.max}
                    placeholder={t("fields.objectiveOtherPlaceholder")}
                    aria-invalid={Boolean(fieldErrors.objectiveOther)}
                    aria-describedby={
                      fieldErrors.objectiveOther
                        ? "objective-other-error"
                        : undefined
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setAnswers((a) => ({ ...a, objectiveOther: value }));
                      if (value.trim() && !isValidOtherText(value)) {
                        setFieldErr("objectiveOther", t("errors.otherText"));
                      } else {
                        clearFieldError("objectiveOther");
                      }
                    }}
                    onBlur={() => {
                      if (!isValidOtherText(answers.objectiveOther)) {
                        setFieldErr("objectiveOther", t("errors.otherText"));
                      }
                    }}
                  />
                </FormField>
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full sm:w-auto"
                  disabled={transitioning}
                  onClick={() => {
                    if (!isValidOtherText(answers.objectiveOther)) {
                      setFieldErr("objectiveOther", t("errors.otherText"));
                      return;
                    }
                    goNext("budget");
                  }}
                >
                  {t("nav.continue")}
                </Button>
              </div>
            ) : null}
            <BackLink
              onClick={() => setStep(lockType ? "intro" : "type")}
              label={t("nav.back")}
            />
          </StepShell>
        );
      }

      case "budget":
        return (
          <StepShell title={t("questions.budget")} hint={stepLabel}>
            <ChoiceCards
              name={t("questions.budget")}
              options={budgetOptions}
              value={answers.budgetRange}
              disabled={transitioning}
              onSelect={(id) => {
                const budgetRange = id as ProjectInquiryBudget;
                if (budgetRange === "custom") {
                  if (transitioning || loading) return;
                  setAnswers((prev) => ({
                    ...prev,
                    budgetRange,
                  }));
                  clearAllFieldErrors();
                  setSubmitError(null);
                  return;
                }
                selectAndAdvance(
                  { budgetRange, budgetCustomAmount: "" },
                  "timeline"
                );
              }}
            />
            {answers.budgetRange === "custom" ? (
              <div className="mt-6 space-y-4">
                <FormField
                  id="budget-custom"
                  label={t("fields.customBudget")}
                  error={fieldErrors.budgetCustomAmount}
                >
                  <div className="relative" dir="ltr">
                    <Input
                      id="budget-custom"
                      type="number"
                      inputMode="numeric"
                      min={PROJECT_INQUIRY_CUSTOM_BUDGET.min}
                      max={PROJECT_INQUIRY_CUSTOM_BUDGET.max}
                      step={1}
                      placeholder={t("fields.customBudgetPlaceholder")}
                      value={answers.budgetCustomAmount}
                      aria-invalid={Boolean(fieldErrors.budgetCustomAmount)}
                      aria-describedby={
                        fieldErrors.budgetCustomAmount
                          ? "budget-custom-error"
                          : undefined
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setAnswers((a) => ({
                          ...a,
                          budgetCustomAmount: value,
                        }));
                        const amount = parseCustomBudgetInput(value);
                        if (
                          value.trim() &&
                          (amount === null ||
                            amount < PROJECT_INQUIRY_CUSTOM_BUDGET.min ||
                            amount > PROJECT_INQUIRY_CUSTOM_BUDGET.max)
                        ) {
                          setFieldErr(
                            "budgetCustomAmount",
                            t("errors.customBudget")
                          );
                        } else {
                          clearFieldError("budgetCustomAmount");
                        }
                      }}
                      onBlur={() => {
                        const amount = parseCustomBudgetInput(
                          answers.budgetCustomAmount
                        );
                        if (
                          amount === null ||
                          amount < PROJECT_INQUIRY_CUSTOM_BUDGET.min ||
                          amount > PROJECT_INQUIRY_CUSTOM_BUDGET.max
                        ) {
                          setFieldErr(
                            "budgetCustomAmount",
                            t("errors.customBudget")
                          );
                        }
                      }}
                      className="pe-10"
                    />
                    <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center font-mono text-xs text-muted-foreground">
                      €
                    </span>
                  </div>
                </FormField>
                <p className="text-xs text-muted-foreground">
                  {t("fields.customBudgetHint", {
                    min: PROJECT_INQUIRY_CUSTOM_BUDGET.min,
                    max: PROJECT_INQUIRY_CUSTOM_BUDGET.max.toLocaleString(
                      locale === "ar" ? "fr-FR" : locale
                    ),
                  })}
                </p>
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full sm:w-auto"
                  disabled={transitioning}
                  onClick={() => {
                    const amount = parseCustomBudgetInput(
                      answers.budgetCustomAmount
                    );
                    if (
                      amount === null ||
                      amount < PROJECT_INQUIRY_CUSTOM_BUDGET.min ||
                      amount > PROJECT_INQUIRY_CUSTOM_BUDGET.max
                    ) {
                      setFieldErr(
                        "budgetCustomAmount",
                        t("errors.customBudget")
                      );
                      return;
                    }
                    goNext("timeline");
                  }}
                >
                  {t("nav.continue")}
                </Button>
              </div>
            ) : null}
            <BackLink onClick={() => setStep("objective")} label={t("nav.back")} />
          </StepShell>
        );

      case "timeline":
        return (
          <StepShell title={t("questions.timeline")} hint={stepLabel}>
            <ChoiceCards
              name={t("questions.timeline")}
              options={timelineOptions}
              value={answers.targetLaunchDate ? null : answers.timeline}
              disabled={transitioning}
              onSelect={(id) => {
                const timeline = id as ProjectInquiryTimeline;
                if (answers.targetLaunchDate) {
                  // Choisir un délai remplace la date précise.
                  selectAndAdvance(
                    { timeline, targetLaunchDate: "" },
                    "description"
                  );
                  return;
                }
                selectAndAdvance({ timeline }, "description");
              }}
            />
            <FormField
              id="launch-date"
              label={t("fields.targetLaunchDate")}
              error={fieldErrors.targetLaunchDate}
              className="mt-6"
            >
              <DatePicker
                id="launch-date"
                value={answers.targetLaunchDate}
                locale={locale}
                placeholder={t("fields.targetLaunchPlaceholder")}
                clearLabel={t("fields.targetLaunchClear")}
                disabled={transitioning}
                invalid={Boolean(fieldErrors.targetLaunchDate)}
                ariaDescribedBy={
                  fieldErrors.targetLaunchDate ? "launch-date-error" : undefined
                }
                onChange={(next) => {
                  clearFieldError("targetLaunchDate");
                  setAnswers((a) => ({
                    ...a,
                    targetLaunchDate: next,
                    // Date précise → pas de délai sélectionné.
                    timeline: next ? null : a.timeline,
                  }));
                }}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("fields.targetLaunchHint")}
              </p>
            </FormField>
            {answers.targetLaunchDate ? (
              <div className="mt-6">
                <Button
                  type="button"
                  size="lg"
                  className="min-h-12 w-full sm:w-auto"
                  disabled={transitioning}
                  onClick={() => goNext("description")}
                >
                  {t("nav.continue")}
                </Button>
              </div>
            ) : null}
            <BackLink onClick={() => setStep("budget")} label={t("nav.back")} />
          </StepShell>
        );

      case "description": {
        const descriptionQuestion =
          lockType && offerCopySlug
            ? t.has(`offers.${offerCopySlug}.descriptionQuestion`)
              ? t(`offers.${offerCopySlug}.descriptionQuestion`)
              : t("offers.generic.descriptionQuestion")
            : t("questions.description");
        const descriptionHelp =
          lockType && offerCopySlug
            ? t.has(`offers.${offerCopySlug}.descriptionHelp`)
              ? t(`offers.${offerCopySlug}.descriptionHelp`)
              : t("offers.generic.descriptionHelp")
            : t("fields.descriptionHelp");
        const descriptionPlaceholder =
          lockType && offerCopySlug
            ? t.has(`offers.${offerCopySlug}.descriptionPlaceholder`)
              ? t(`offers.${offerCopySlug}.descriptionPlaceholder`)
              : t("offers.generic.descriptionPlaceholder")
            : t("fields.descriptionPlaceholder");
        return (
          <StepShell title={descriptionQuestion} hint={stepLabel}>
            <p className="mb-4 text-sm text-muted-foreground">
              {descriptionHelp}
            </p>
            <FormField
              id="proj-desc"
              label={t("summary.project")}
              error={fieldErrors.description}
            >
              <Textarea
                id="proj-desc"
                rows={7}
                value={answers.description}
                maxLength={PROJECT_INQUIRY_TEXT_LIMITS.descriptionMax}
                placeholder={descriptionPlaceholder}
                onChange={(e) => {
                  const value = e.target.value;
                  setAnswers((a) => ({ ...a, description: value }));
                  if (value.trim().length > 0 && value.trim().length < 10) {
                    setFieldErr("description", t("errors.description"));
                  } else {
                    clearFieldError("description");
                  }
                }}
                onBlur={() => {
                  if (answers.description.trim().length < 10) {
                    setFieldErr("description", t("errors.description"));
                  }
                }}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={
                  fieldErrors.description ? "proj-desc-error" : undefined
                }
                className="min-h-40"
              />
            </FormField>
            <div className="mt-6">
              <Button
                  type="button"
                size="lg"
                className="min-h-12 w-full sm:w-auto"
                disabled={transitioning}
                  onClick={() => {
                    if (answers.description.trim().length < 10) {
                      setFieldErr("description", t("errors.description"));
                      focusField("proj-desc");
                      return;
                  }
                  goNext("contact");
                }}
              >
                {t("nav.continue")}
              </Button>
            </div>
            <BackLink onClick={() => setStep("timeline")} label={t("nav.back")} />
          </StepShell>
        );
      }

      case "contact":
        return (
          <StepShell title={t("questions.contact")} hint={stepLabel}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="inq-name"
                label={t("fields.name")}
                required
                error={fieldErrors.name}
              >
                <Input
                  id="inq-name"
                  autoComplete="name"
                  required
                  maxLength={PROJECT_INQUIRY_TEXT_LIMITS.nameMax}
                  value={answers.name}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "inq-name-error" : undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAnswers((a) => ({ ...a, name: value }));
                    if (value.trim().length > 0 && value.trim().length < 2) {
                      setFieldErr("name", tVal("nameTooShort"));
                    } else {
                      clearFieldError("name");
                    }
                  }}
                  onBlur={() => {
                    if (answers.name.trim().length < 2) {
                      setFieldErr("name", tVal("nameTooShort"));
                    }
                  }}
                />
              </FormField>
              <FormField
                id="inq-email"
                label={t("fields.email")}
                required
                error={fieldErrors.email}
              >
                <Input
                  id="inq-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={PROJECT_INQUIRY_TEXT_LIMITS.emailMax}
                  value={answers.email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "inq-email-error" : undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAnswers((a) => ({ ...a, email: value }));
                    if (value.trim() && !isValidEmail(value)) {
                      setFieldErr("email", tVal("emailInvalid"));
                    } else {
                      clearFieldError("email");
                    }
                  }}
                  onBlur={() => {
                    if (!isValidEmail(answers.email)) {
                      setFieldErr("email", tVal("emailInvalid"));
                    }
                  }}
                />
              </FormField>
              <FormField
                id="inq-wa"
                label={t("fields.whatsapp")}
                error={fieldErrors.whatsapp}
              >
                <Input
                  id="inq-wa"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={PROJECT_INQUIRY_TEXT_LIMITS.phoneMax}
                  placeholder="+33…"
                  value={answers.whatsapp}
                  aria-invalid={Boolean(fieldErrors.whatsapp)}
                  aria-describedby={fieldErrors.whatsapp ? "inq-wa-error" : undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAnswers((a) => ({ ...a, whatsapp: value }));
                    if (value.trim() && !isValidPhone(value)) {
                      setFieldErr("whatsapp", t("errors.invalidPhone"));
                    } else {
                      clearFieldError("whatsapp");
                    }
                  }}
                  onBlur={() => {
                    if (
                      answers.whatsapp.trim() &&
                      !isValidPhone(answers.whatsapp)
                    ) {
                      setFieldErr("whatsapp", t("errors.invalidPhone"));
                    }
                  }}
                />
              </FormField>
              <FormField id="inq-company" label={t("fields.company")}>
                <Input
                  id="inq-company"
                  autoComplete="organization"
                  maxLength={PROJECT_INQUIRY_TEXT_LIMITS.companyMax}
                  value={answers.company}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, company: e.target.value }))
                  }
                />
              </FormField>
              <FormField
                id="inq-site"
                label={t("fields.website")}
                error={fieldErrors.currentWebsite}
              >
                <Input
                  id="inq-site"
                  type="url"
                  maxLength={PROJECT_INQUIRY_TEXT_LIMITS.websiteMax}
                  placeholder="https://"
                  value={answers.currentWebsite}
                  aria-invalid={Boolean(fieldErrors.currentWebsite)}
                  aria-describedby={
                    fieldErrors.currentWebsite ? "inq-site-error" : undefined
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setAnswers((a) => ({
                      ...a,
                      currentWebsite: value,
                    }));
                    if (value.trim() && !isSafeHttpUrl(value.trim())) {
                      setFieldErr(
                        "currentWebsite",
                        t("errors.invalidWebsite")
                      );
                    } else {
                      clearFieldError("currentWebsite");
                    }
                  }}
                  onBlur={() => {
                    if (
                      answers.currentWebsite.trim() &&
                      !isSafeHttpUrl(answers.currentWebsite.trim())
                    ) {
                      setFieldErr(
                        "currentWebsite",
                        t("errors.invalidWebsite")
                      );
                    }
                  }}
                />
              </FormField>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {t.rich("privacyNotice", {
                legal: (chunks) => (
                  <Link
                    href={routes.legal}
                    className="underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
            <HoneypotField
              name="_honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
            {submitError ? <FormError message={submitError} /> : null}
            <div className="mt-6">
              <Button
                type="button"
                size="lg"
                className="min-h-12 w-full sm:w-auto"
                disabled={transitioning}
                onClick={() => {
                  const nextErrors: Partial<Record<FieldKey, string>> = {};
                  if (answers.name.trim().length < 2) {
                    nextErrors.name = tVal("nameTooShort");
                  }
                  if (!isValidEmail(answers.email)) {
                    nextErrors.email = tVal("emailInvalid");
                  }
                  if (
                    answers.whatsapp.trim() &&
                    !isValidPhone(answers.whatsapp)
                  ) {
                    nextErrors.whatsapp = t("errors.invalidPhone");
                  }
                  if (
                    answers.currentWebsite.trim() &&
                    !isSafeHttpUrl(answers.currentWebsite.trim())
                  ) {
                    nextErrors.currentWebsite = t("errors.invalidWebsite");
                  }
                  if (Object.keys(nextErrors).length > 0) {
                    setFieldErrors(nextErrors);
                    const firstField = [
                      ["name", "inq-name"],
                      ["email", "inq-email"],
                      ["whatsapp", "inq-wa"],
                      ["currentWebsite", "inq-site"],
                    ].find(([key]) => Boolean(nextErrors[key as FieldKey]));
                    if (firstField) focusField(firstField[1]);
                    return;
                  }
                  setSubmitError(null);
                  goNext("summary");
                }}
              >
                {t("nav.review")}
              </Button>
            </div>
            <BackLink
              onClick={() => setStep("description")}
              label={t("nav.back")}
            />
          </StepShell>
        );

      case "summary":
        return (
          <div className="min-w-0 space-y-5">
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                {t("brand")}
              </p>
              <h1
                data-step-heading
                tabIndex={-1}
                className="font-display text-2xl font-semibold tracking-tight text-foreground outline-none sm:text-[1.75rem]"
              >
                {t("summary.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t.has("summary.subtitle")
                  ? t("summary.subtitle")
                  : t("summary.title")}
              </p>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-border-gold/80 bg-surface-elevated/90 shadow-[inset_0_1px_0_rgba(244,241,232,0.04)]">
              <div className="grid gap-0 sm:grid-cols-2">
                <SummaryCell
                  label={
                    lockType && serviceTitle
                      ? t("summary.offer")
                      : t("summary.type")
                  }
                  value={
                    lockType && serviceTitle
                      ? serviceTitle
                      : answers.projectType === "other" &&
                          answers.projectTypeOther.trim()
                        ? answers.projectTypeOther.trim()
                        : answers.projectType
                          ? t(`types.${answers.projectType}.title`)
                          : "—"
                  }
                />
                <SummaryCell
                  label={t("summary.objective")}
                  value={
                    answers.objective === "other" &&
                    answers.objectiveOther.trim()
                      ? answers.objectiveOther.trim()
                      : answers.objective
                        ? offerCopySlug &&
                          t.has(
                            `offers.${offerCopySlug}.objectives.${answers.objective}`
                          )
                          ? t(
                              `offers.${offerCopySlug}.objectives.${answers.objective}`
                            )
                          : t(`objectives.${answers.objective}`)
                        : "—"
                  }
                />
                <SummaryCell
                  label={t("summary.budget")}
                  value={formatBudgetSummary(
                    answers,
                    (id) => t(`budgets.${id}`),
                    (amount) =>
                      t("budgets.customAmount", {
                        amount: amount.toLocaleString(
                          locale === "ar" ? "fr-FR" : locale
                        ),
                      })
                  )}
                  valueDir="ltr"
                />
                {answers.timeline ? (
                  <SummaryCell
                    label={t("summary.timeline")}
                    value={t(`timelines.${answers.timeline}`)}
                  />
                ) : null}
              </div>

              <div className="space-y-0 border-t border-border/70">
                {answers.targetLaunchDate ? (
                  <SummaryCell
                    label={t("fields.targetLaunchDate")}
                    value={answers.targetLaunchDate}
                    valueDir="ltr"
                    dense
                  />
                ) : null}
                <SummaryCell
                  label={t("summary.project")}
                  value={answers.description}
                  clamp
                  dense
                />
                <SummaryCell
                  label={t("summary.contact")}
                  value={`${answers.name}\n${answers.email}${
                    answers.company ? `\n${answers.company}` : ""
                  }${
                    answers.whatsapp ? `\n${answers.whatsapp}` : ""
                  }`}
                  dense
                  last
                />
              </div>
            </div>

            {!fullscreen ? summaryActions : null}
          </div>
        );

      case "success":
        return (
          <div className="space-y-5 text-center sm:text-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              {reference ?? t("brand")}
            </p>
            <h1
              data-step-heading
              tabIndex={-1}
              className="font-display text-3xl font-semibold text-foreground outline-none"
            >
              {t("success.title")}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("success.body")}
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
              <Building2 className="h-4 w-4 text-primary/70" aria-hidden />
              <span className="font-mono text-xs tracking-wide">VORZIX</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  const summaryActions = (
    <div className="space-y-3">
      {submitError ? <FormError message={submitError} /> : null}
      {turnstileEnabled ? (
        <TurnstileWidget
          ref={turnstileRef}
          action="project_inquiry"
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
          size="flexible"
          language={locale}
          className="w-full"
        />
      ) : null}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          className="min-h-12 w-full"
          loading={loading}
          disabled={transitioning}
          onClick={() => void submit()}
        >
          {loading ? t("summary.sending") : t("summary.submit")}
        </Button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setStep(firstQuestionStep)}
          className="min-h-10 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
        >
          {t("summary.edit")}
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={flowRef}
      className={cn(
        "relative overflow-hidden bg-background",
        fullscreen
          ? "fixed inset-0 z-[80] flex min-h-dvh flex-col"
          : "mx-auto max-w-2xl overflow-x-clip px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32"
      )}
      initial={
        fullscreen && !reduceMotion
          ? { opacity: 0 }
          : false
      }
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.35 }}
    >
      <div
        className="pointer-events-none absolute inset-0 celestial-vault opacity-35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,169,106,0.07),transparent_55%)]"
        aria-hidden
      />

      {fullscreen ? (
        <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-6">
          <Link
            href={routes.home}
            className="flex min-h-11 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={t("nav.exit")}
          >
            <BrandLogo showSubtitle={false} className="gap-2" />
          </Link>
          <Button asChild variant="ghost" size="sm" className="min-h-11 gap-2">
            <Link href={routes.home} aria-label={t("nav.exit")}>
              <X className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{t("nav.exit")}</span>
            </Link>
          </Button>
        </header>
      ) : null}

      <div
        className={cn(
          "relative z-10 mx-auto w-full min-w-0 max-w-2xl flex-1 px-4 sm:px-6",
          fullscreen
            ? cn(
                "scrollbar-overlay flex flex-col overflow-y-auto overscroll-contain",
                step === "summary"
                  ? "justify-start py-5 pb-6 sm:py-6"
                  : step === "success"
                    ? "justify-center py-8 pb-16"
                    : "justify-center py-6 pb-16 sm:py-10"
              )
            : "space-y-10"
        )}
      >
        <div
          className={cn(
            "min-w-0",
            fullscreen &&
              (step === "summary" ? "space-y-5" : "space-y-5 sm:space-y-8")
          )}
        >
          {step !== "intro" && step !== "summary" && step !== "success" ? (
            <ProjectConstellation
              completedCount={completed}
              currentIndex={currentIndex}
              projectType={answers.projectType}
              nodeCount={questionSteps.length}
              ariaLabel={stepLabel}
              rtl={locale === "ar"}
              className="mx-auto flex justify-center"
            />
          ) : null}

        {step === "summary" ? (
          <div
            className="flex items-center justify-center gap-1.5"
            aria-hidden
          >
            {Array.from({ length: questionSteps.length }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(201,169,106,0.45)]"
              />
            ))}
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {stepLabel}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={
              reduceMotion ? false : { opacity: 0, y: 10 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.28 }}
            className={cn(transitioning && "pointer-events-none")}
          >
            {renderQuestionBody()}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {fullscreen && step === "summary" ? (
        <div className="relative z-20 shrink-0 border-t border-border/50 bg-[#070A12]/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:px-6">
          <div
            className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#070A12] to-transparent"
            aria-hidden
          />
          <div className="mx-auto w-full min-w-0 max-w-2xl">
            {summaryActions}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

function StepShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {hint}
        </p>
        <h1
          data-step-heading
          tabIndex={-1}
          className="mt-2 font-display text-2xl font-semibold text-foreground outline-none sm:text-3xl"
        >
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

function BackLink({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {label}
    </button>
  );
}

function SummaryCell({
  label,
  value,
  valueDir,
  clamp = false,
  dense = false,
  last = false,
}: {
  label: string;
  value: string;
  valueDir?: "ltr" | "rtl";
  clamp?: boolean;
  dense?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 px-4 py-3.5 sm:px-5",
        dense
          ? cn(!last && "border-b border-border/60")
          : "border-b border-border/60 sm:[&:nth-child(odd)]:border-e sm:[&:nth-child(odd)]:border-border/60"
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/75">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 max-w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90 [overflow-wrap:anywhere]",
          clamp && "line-clamp-3"
        )}
        dir={valueDir}
        style={valueDir === "ltr" ? { unicodeBidi: "isolate" } : undefined}
        title={clamp ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}

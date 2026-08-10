"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  AppWindow,
  Bot,
  Building2,
  Globe,
  Layers,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { HoneypotField } from "@/components/ui/honeypot-field";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { ChoiceCards } from "@/components/project-inquiry/choice-cards";
import {
  ProjectConstellation,
  constellationIndexForStep,
} from "@/components/project-inquiry/project-constellation";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { routes } from "@/lib/routes";
import {
  PROJECT_INQUIRY_BUDGETS,
  PROJECT_INQUIRY_CUSTOM_BUDGET,
  PROJECT_INQUIRY_OBJECTIVES,
  PROJECT_INQUIRY_OTHER_TEXT,
  PROJECT_INQUIRY_TIMELINES,
  PROJECT_INQUIRY_TYPES,
  type ProjectInquiryBudget,
  type ProjectInquiryObjective,
  type ProjectInquiryStep,
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
  | "currentWebsite";

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

const STORAGE_KEY = "vorzix_project_inquiry_draft_v1";

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

const QUESTION_STEPS: ProjectInquiryStep[] = [
  "type",
  "objective",
  "budget",
  "timeline",
  "description",
  "contact",
];

function completedCountFromAnswers(
  answers: Answers,
  step: ProjectInquiryStep
): number {
  let n = 0;
  if (answers.projectType) n = 1;
  if (answers.objective) n = 2;
  if (answers.budgetRange) n = 3;
  if (answers.timeline || answers.targetLaunchDate) n = 4;
  if (answers.description.trim().length >= 10) n = 5;
  if (
    answers.name.trim().length >= 2 &&
    answers.email.includes("@")
  ) {
    n = 6;
  }
  // Pendant une étape question, ne pas compter au-delà de l'étape courante-1
  // sauf si déjà répondu — on synchronise avec les réponses réelles.
  if (step === "intro") return 0;
  if (step === "summary" || step === "success") return 6;
  return n;
}

const TYPE_ICONS: Record<ProjectInquiryType, React.ReactNode> = {
  showcase: <Globe className="h-4 w-4" />,
  ecommerce: <ShoppingBag className="h-4 w-4" />,
  web_app: <AppWindow className="h-4 w-4" />,
  saas: <Layers className="h-4 w-4" />,
  redesign: <RefreshCw className="h-4 w-4" />,
  automation: <Bot className="h-4 w-4" />,
  other: <Sparkles className="h-4 w-4" />,
};

export function ProjectInquiryFlow({
  source,
  fullscreen = false,
  initialProjectType,
  serviceId,
  serviceReference,
}: {
  source?: string;
  fullscreen?: boolean;
  /** Pré-sélection depuis une offre — modifiable par le visiteur. */
  initialProjectType?: ProjectInquiryType | null;
  serviceId?: string | null;
  serviceReference?: string | null;
}) {
  const t = useTranslations("projectInquiry");
  const tVal = useTranslations("validation");
  const locale = useLocale() as "fr" | "en" | "ar";
  const reduceMotion = useReducedMotion();
  const { loading, setLoading, trySubmit } = useSubmitGuard();

  const [step, setStep] = useState<ProjectInquiryStep>("intro");
  const [answers, setAnswers] = useState<Answers>(() => {
    const base = emptyAnswers();
    if (
      initialProjectType &&
      (PROJECT_INQUIRY_TYPES as readonly string[]).includes(initialProjectType)
    ) {
      base.projectType = initialProjectType;
    }
    return base;
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
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          step?: ProjectInquiryStep;
          answers?: Answers;
        };
        if (parsed.answers) {
          const merged = { ...emptyAnswers(), ...parsed.answers };
          // Contexte offre : pré-sélection seulement si le brouillon n’a pas encore de type
          if (!merged.projectType && initialProjectType) {
            merged.projectType = initialProjectType;
          }
          setAnswers(merged);
        }
        if (
          parsed.step &&
          parsed.step !== "success" &&
          parsed.step !== "intro"
        ) {
          setStep(parsed.step);
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
    // Intentionnel : hydratation unique au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated || step === "success") return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, answers })
      );
    } catch {
      /* ignore */
    }
  }, [answers, step, hydrated]);

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

  const currentIndex = constellationIndexForStep(step);
  const completed = completedCountFromAnswers(answers, step);

  const stepLabel = useMemo(() => {
    const qi = QUESTION_STEPS.indexOf(step);
    if (qi < 0) return t("progress.overview");
    return t("progress.step", {
      current: qi + 1,
      total: QUESTION_STEPS.length,
      label: t(`nodes.${QUESTION_STEPS[qi]}`),
    });
  }, [step, t]);

  const typeOptions = PROJECT_INQUIRY_TYPES.map((id) => ({
    id,
    title: t(`types.${id}.title`),
    description: t(`types.${id}.description`),
    icon: TYPE_ICONS[id],
  }));

  const objectiveOptions = PROJECT_INQUIRY_OBJECTIVES.map((id) => ({
    id,
    title: t(`objectives.${id}`),
  }));

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
        if (res.status === 429) {
          setSubmitError(
            body.error === "dailyRateLimited"
              ? tVal("dailyRateLimited")
              : tVal("rateLimited")
          );
        } else if (body.error === "invalidPhone") {
          setFieldErr(
            body.field === "phone" ? "whatsapp" : "whatsapp",
            t("errors.invalidPhone")
          );
        } else if (body.field === "objectiveOther") {
          setFieldErr("objectiveOther", t("errors.otherText"));
        } else if (body.field === "projectTypeOther") {
          setFieldErr("projectTypeOther", t("errors.otherText"));
        } else if (body.field === "currentWebsite") {
          setFieldErr("currentWebsite", t("errors.invalidWebsite"));
        } else if (body.field === "timeline") {
          setSubmitError(t("errors.timelineOrDate"));
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
      setSubmitError(tVal("networkError"));
    } finally {
      setLoading(false);
    }
  }

  function renderQuestionBody() {
    switch (step) {
      case "intro":
        return (
          <div className="space-y-6 text-center sm:text-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
              {t("brand")}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("intro.title")}
            </h1>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:mx-0 sm:text-base">
              {t("intro.subtitle")}
            </p>
            <Button
              type="button"
              size="lg"
              className="min-h-12 w-full sm:w-auto"
              onClick={() => goNext("type")}
            >
              {t("intro.cta")}
            </Button>
          </div>
        );

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

      case "objective":
        return (
          <StepShell title={t("questions.objective")} hint={stepLabel}>
            <ChoiceCards
              name={t("questions.objective")}
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
            <BackLink onClick={() => setStep("type")} label={t("nav.back")} />
          </StepShell>
        );

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
              className="mt-6"
            >
              <DatePicker
                id="launch-date"
                value={answers.targetLaunchDate}
                locale={locale}
                placeholder={t("fields.targetLaunchPlaceholder")}
                clearLabel={t("fields.targetLaunchClear")}
                disabled={transitioning}
                onChange={(next) => {
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

      case "description":
        return (
          <StepShell title={t("questions.description")} hint={stepLabel}>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("fields.descriptionHelp")}
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
                  value={answers.name}
                  aria-invalid={Boolean(fieldErrors.name)}
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
                  value={answers.email}
                  aria-invalid={Boolean(fieldErrors.email)}
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
                  placeholder="+33…"
                  value={answers.whatsapp}
                  aria-invalid={Boolean(fieldErrors.whatsapp)}
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
                  placeholder="https://"
                  value={answers.currentWebsite}
                  aria-invalid={Boolean(fieldErrors.currentWebsite)}
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
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                {t("summary.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t.has("summary.subtitle")
                  ? t("summary.subtitle")
                  : t("summary.title")}
              </p>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-border-gold/80 bg-surface-elevated/90 shadow-[inset_0_1px_0_rgba(244,241,232,0.04)]">
              <div className="grid gap-0 sm:grid-cols-2">
                <SummaryCell
                  label={t("summary.type")}
                  value={
                    answers.projectType === "other" &&
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
                        ? t(`objectives.${answers.objective}`)
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
            <h2 className="font-display text-3xl font-semibold text-foreground">
              {t("success.title")}
            </h2>
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
          onClick={() => setStep("type")}
          className="min-h-10 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
        >
          {t("summary.edit")}
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
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
            fullscreen && (step === "summary" ? "space-y-5" : "space-y-8")
          )}
        >
        {step !== "intro" && step !== "summary" && step !== "success" ? (
          <ProjectConstellation
            completedCount={completed}
            currentIndex={currentIndex}
            projectType={answers.projectType}
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
            {Array.from({ length: 6 }).map((_, i) => (
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
        <h2 className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h2>
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

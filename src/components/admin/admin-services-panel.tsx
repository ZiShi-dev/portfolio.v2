"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { readAdminApiError } from "@/lib/admin/api-error";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { PROJECT_INQUIRY_TYPES } from "@/data/project-inquiry-options";
import { SERVICE_ICON_KEYS } from "@/lib/services/icons";
import {
  SERVICE_CURRENCIES,
  SERVICE_LIMITS,
  SERVICE_PRICING_MODES,
  SERVICE_STATUSES,
  emptyServiceI18n,
  parseServiceWriteBody,
  slugifyServiceTitle,
  type ServiceCaseStudyInput,
  type ServicePricingMode,
  type ServiceStatus,
} from "@/lib/services/schema";
import { parseProjectSlugFromInput } from "@/lib/services/project-ref";
import {
  centsToEurosInput,
  parseEurosToCents,
} from "@/lib/services/pricing";
import type { ServiceI18n, ServiceRow } from "@/lib/services/store";
import { cn } from "@/lib/utils";
import { useSubmitGuard } from "@/hooks/use-submit-guard";

type LocaleTab = keyof ServiceI18n;
type StatusFilter = "all" | "published" | "draft" | "archived";
const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "published",
  "draft",
  "archived",
];

const FORM_SECTIONS = [
  { id: "svc-sec-identity", key: "identity" },
  { id: "svc-sec-commerce", key: "commerce" },
  { id: "svc-sec-pricing", key: "pricing" },
  { id: "svc-sec-texts", key: "texts" },
  { id: "svc-sec-features", key: "features" },
  { id: "svc-sec-caseStudies", key: "caseStudies" },
] as const;

type CaseStudyOption = {
  id: string;
  slug: string;
  reference: string | null;
  title: string;
  published: boolean;
};

type EditorState = {
  id?: string;
  reference: string;
  slug: string;
  icon: string;
  status: ServiceStatus;
  sortOrder: number;
  title: ServiceI18n;
  shortDescription: ServiceI18n;
  description: ServiceI18n;
  idealFor: ServiceI18n;
  includedFeatures: ServiceI18n[];
  ctaLabel: ServiceI18n;
  showCtaStart: boolean;
  pricingMode: ServicePricingMode;
  startingPriceEuros: string;
  currency: (typeof SERVICE_CURRENCIES)[number];
  inquiryProjectType: string;
  caseStudies: ServiceCaseStudyInput[];
  seoTitle: ServiceI18n;
  seoDescription: ServiceI18n;
};

const emptyI18n = (): ServiceI18n => ({ fr: "", en: "", ar: "" });

function emptyEditor(): EditorState {
  return {
    reference: "",
    slug: "",
    icon: "sparkles",
    status: "draft",
    sortOrder: 0,
    title: emptyI18n(),
    shortDescription: emptyI18n(),
    description: emptyI18n(),
    idealFor: emptyI18n(),
    includedFeatures: [],
    ctaLabel: emptyI18n(),
    showCtaStart: true,
    pricingMode: "contact",
    startingPriceEuros: "",
    currency: "EUR",
    inquiryProjectType: "",
    caseStudies: [],
    seoTitle: emptyI18n(),
    seoDescription: emptyI18n(),
  };
}

function rowToEditor(row: ServiceRow): EditorState {
  return {
    id: row.id,
    reference: row.reference,
    slug: row.slug,
    icon: row.icon,
    status: row.status,
    sortOrder: row.sort_order,
    title: { ...row.title },
    shortDescription: { ...row.short_description },
    description: { ...row.description },
    idealFor: { ...row.ideal_for },
    includedFeatures: row.included_features.map((f) => ({ ...f })),
    ctaLabel: { ...row.cta_label },
    showCtaStart: row.show_cta_start,
    pricingMode: row.pricing_mode,
    startingPriceEuros: centsToEurosInput(row.starting_price_cents),
    currency: row.currency,
    inquiryProjectType: row.inquiry_project_type ?? "",
    caseStudies: (row.case_studies?.length
      ? row.case_studies
      : row.case_study_ids.map((project_id) => ({
          project_id,
          blurb: emptyServiceI18n(),
        }))
    ).map((item) => ({
      projectId: item.project_id,
      blurb: {
        fr: item.blurb?.fr ?? "",
        en: item.blurb?.en ?? "",
        ar: item.blurb?.ar ?? "",
      },
    })),
    seoTitle: { ...row.seo_title },
    seoDescription: { ...row.seo_description },
  };
}

function editorToPayload(editor: EditorState) {
  const startingPriceCents =
    editor.pricingMode === "starting_at" || editor.pricingMode === "fixed"
      ? parseEurosToCents(editor.startingPriceEuros)
      : null;

  return {
    reference: editor.reference.trim(),
    slug: editor.slug.trim().toLowerCase(),
    icon: editor.icon,
    status: editor.status,
    sortOrder: editor.sortOrder,
    title: editor.title,
    shortDescription: editor.shortDescription,
    description: editor.description,
    idealFor: editor.idealFor,
    includedFeatures: editor.includedFeatures.filter((f) => f.fr.trim()),
    ctaLabel: editor.ctaLabel,
    showCtaStart: editor.showCtaStart,
    pricingMode: editor.pricingMode,
    startingPriceCents,
    currency: editor.currency,
    inquiryProjectType: editor.inquiryProjectType || null,
    caseStudies: editor.caseStudies,
    caseStudyIds: editor.caseStudies.map((item) => item.projectId),
    seoTitle: editor.seoTitle,
    seoDescription: editor.seoDescription,
  };
}

type AdminServicesPanelProps = {
  initialServices?: ServiceRow[];
  initialConfigured?: boolean;
  caseStudyOptions?: CaseStudyOption[];
};

export function AdminServicesPanel({
  initialServices = [],
  initialConfigured = true,
  caseStudyOptions = [],
}: AdminServicesPanelProps) {
  const t = useTranslations("admin.services");
  const tErrors = useTranslations("admin.errors");
  const { loading, setLoading, trySubmit } = useSubmitGuard();

  const [services, setServices] = useState<ServiceRow[]>(initialServices);
  const [configured, setConfigured] = useState(initialConfigured);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [localeTab, setLocaleTab] = useState<LocaleTab>("fr");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [projectRefInput, setProjectRefInput] = useState("");
  const [projectLinkError, setProjectLinkError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const formScrollRef = useRef<HTMLDivElement>(null);

  const jumpToSection = (id: string) => {
    const root = formScrollRef.current;
    const target = root?.querySelector<HTMLElement>(`#${id}`);
    if (!root || !target) return;
    const offset =
      target.getBoundingClientRect().top -
      root.getBoundingClientRect().top +
      root.scrollTop -
      8;
    root.scrollTo({
      top: Math.max(0, offset),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/services", { credentials: "include" });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        configured?: boolean;
        services?: ServiceRow[];
      };
      if (!res.ok || !body.ok) {
        setListError(t("loadError"));
        return;
      }
      setConfigured(Boolean(body.configured));
      setServices(body.services ?? []);
      setListError(null);
    } catch {
      setListError(t("loadError"));
    }
  }, [t]);

  const openCreate = () => {
    setEditor(emptyEditor());
    setLocaleTab("fr");
    setSubmitError(null);
    setProjectRefInput("");
    setProjectLinkError(null);
    setEditorOpen(true);
  };

  const openEdit = (row: ServiceRow) => {
    setEditor(rowToEditor(row));
    setLocaleTab("fr");
    setSubmitError(null);
    setProjectRefInput("");
    setProjectLinkError(null);
    setEditorOpen(true);
  };

  const moveFeature = (index: number, dir: -1 | 1) => {
    setEditor((prev) => {
      const next = [...prev.includedFeatures];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, includedFeatures: next };
    });
  };

  const addCaseStudy = (projectId: string): boolean => {
    if (editor.caseStudies.some((item) => item.projectId === projectId)) {
      setProjectLinkError(t("alreadyLinked"));
      return false;
    }
    if (editor.caseStudies.length >= SERVICE_LIMITS.maxCaseStudies) {
      setProjectLinkError(t("tooManyProjects"));
      return false;
    }
    setEditor((prev) => ({
      ...prev,
      caseStudies: [
        ...prev.caseStudies,
        { projectId, blurb: emptyServiceI18n() },
      ],
    }));
    setProjectLinkError(null);
    return true;
  };

  const addCaseStudyFromInput = () => {
    const slug = parseProjectSlugFromInput(projectRefInput);
    if (!slug) {
      setProjectLinkError(t("projectNotFound"));
      return;
    }
    const match = caseStudyOptions.find((opt) => opt.slug === slug);
    if (!match) {
      setProjectLinkError(t("projectNotFound"));
      return;
    }
    if (addCaseStudy(match.id)) {
      setProjectRefInput("");
    }
  };

  const moveCaseStudy = (index: number, dir: -1 | 1) => {
    setEditor((prev) => {
      const next = [...prev.caseStudies];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, caseStudies: next };
    });
  };

  const save = async (publish?: boolean) => {
    if (!trySubmit()) return;
    setLoading(true);
    setSubmitError(null);

    const draft = { ...editor };
    if (publish === true) draft.status = "published";
    if (publish === false && draft.status === "published") {
      draft.status = "draft";
    }
    if (!draft.slug && draft.title.fr) {
      draft.slug = slugifyServiceTitle(draft.title.fr);
    }

    const payload = editorToPayload(draft);
    const parsed = parseServiceWriteBody(payload);
    if (!parsed.ok) {
      setSubmitError(translateErr(parsed.error, tErrors));
      setLoading(false);
      return;
    }

    try {
      const isEdit = Boolean(draft.id);
      const res = await fetch(
        isEdit ? `/api/admin/services/${draft.id}` : "/api/admin/services",
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.values),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = readAdminApiError(
          res,
          body as { error?: string; code?: string },
          tErrors("generic"),
          (key) => translateErr(key, tErrors)
        );
        setSubmitError(errMsg);
        return;
      }
      setEditorOpen(false);
      await refresh();
    } catch {
      setSubmitError(tErrors("generic"));
    } finally {
      setLoading(false);
    }
  };

  const patchStatus = async (id: string, status: ServiceStatus) => {
    if (!trySubmit()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errMsg = readAdminApiError(
          res,
          body as { error?: string; code?: string },
          tErrors("generic"),
          (key) => translateErr(key, tErrors)
        );
        setListError(errMsg);
        return;
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const duplicate = async (id: string) => {
    if (!trySubmit()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      if (!res.ok) {
        setListError(t("duplicateError"));
        return;
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    if (!trySubmit()) return false;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setListError(t("deleteError"));
        return false;
      }
      setEditorOpen(false);
      await refresh();
      return true;
    } finally {
      setLoading(false);
    }
  };

  const visibleServices = useMemo(() => {
    if (statusFilter === "all") return services;
    return services.filter((row) => row.status === statusFilter);
  }, [services, statusFilter]);

  const moveOrder = async (id: string, dir: -1 | 1) => {
    const index = services.findIndex((row) => row.id === id);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= services.length) return;
    const ordered = [...services];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setServices(ordered);
    setLoading(true);
    try {
      await fetch("/api/admin/services", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: ordered.map((s) => s.id),
        }),
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const caseStudyLabel = useMemo(() => {
    const map = new Map<string, CaseStudyOption>();
    for (const opt of caseStudyOptions) map.set(opt.id, opt);
    return map;
  }, [caseStudyOptions]);

  if (!configured) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">{t("notConfiguredTitle")}</h2>
        <p className="mt-2 text-sm text-foreground/65">{t("notConfiguredBody")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-foreground/80 sm:text-base">
          {t("listTitle")}
          {services.length > 0 ? (
            <span className="ms-2 text-foreground/45">({services.length})</span>
          ) : null}
        </h2>
        <Button type="button" onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" aria-hidden />
          {t("create")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={t("filtersLabel")}>
        {STATUS_FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={cn(
              "min-h-9 rounded-full border px-3 font-mono text-[10px] uppercase tracking-wider transition-colors",
              statusFilter === key
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-foreground/60 hover:border-primary/30"
            )}
          >
            {t(`filters.${key}`)}
          </button>
        ))}
      </div>

      {listError ? <FormError message={listError} /> : null}

      {visibleServices.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-foreground/55">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid gap-3 sm:gap-4">
          {visibleServices.map((row, index) => {
            const name = row.title.fr || row.title.en || row.slug;
            const pricingLabel =
              (row.pricing_mode === "starting_at" ||
                row.pricing_mode === "fixed") &&
              row.starting_price_cents !== null
                ? `${(row.starting_price_cents / 100).toLocaleString("fr-FR")} ${row.currency}`
                : t(`pricingMode.${row.pricing_mode}`);

            return (
              <li
                key={row.id}
                className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/75">
                        {row.reference}
                      </span>
                      <StatusBadge status={row.status} t={t} />
                    </div>

                    <h3 className="truncate font-display text-lg font-semibold text-foreground">
                      {name}
                    </h3>
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
                      /offres/{row.slug}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:border-primary/40 disabled:opacity-40"
                      onClick={() => moveOrder(row.id, -1)}
                      aria-label={t("moveUp")}
                      disabled={loading || index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:border-primary/40 disabled:opacity-40"
                      onClick={() => moveOrder(row.id, 1)}
                      aria-label={t("moveDown")}
                      disabled={
                        loading || index === visibleServices.length - 1
                      }
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-foreground/60">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
                      {t("cols.pricing")}
                    </dt>
                    <dd className="mt-0.5 text-foreground/75">{pricingLabel}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
                      {t("cols.updated")}
                    </dt>
                    <dd className="mt-0.5 text-foreground/75">
                      {new Date(row.updated_at).toLocaleDateString("fr-FR")}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="min-h-10"
                      onClick={() => openEdit(row)}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="min-h-10"
                      asChild
                    >
                      <a
                        href={`${ADMIN_ROUTES.services}/preview/${row.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                        {t("preview")}
                      </a>
                    </Button>
                    {row.status === "published" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="min-h-10"
                        onClick={() => patchStatus(row.id, "draft")}
                        disabled={loading}
                      >
                        {t("unpublish")}
                      </Button>
                    ) : row.status === "archived" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="min-h-10"
                        onClick={() => patchStatus(row.id, "draft")}
                        disabled={loading}
                      >
                        {t("restore")}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="min-h-10"
                        onClick={() => patchStatus(row.id, "published")}
                        disabled={loading}
                      >
                        {t("publish")}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="min-h-10"
                      onClick={() => duplicate(row.id)}
                      disabled={loading}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      <span className="sm:inline">
                        {safeT(t, "duplicate", "Dupliquer")}
                      </span>
                    </Button>
                    {row.status !== "archived" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="min-h-10"
                        onClick={() => patchStatus(row.id, "archived")}
                        disabled={loading}
                      >
                        <Archive className="h-4 w-4" aria-hidden />
                        <span className="hidden sm:inline">
                          {safeT(t, "archive", "Archiver")}
                        </span>
                      </Button>
                    ) : null}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="min-h-10 text-destructive hover:text-destructive"
                          disabled={loading}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          {t("deleteConfirm")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("deleteBody")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(row.id)}>
                            {t("deleteConfirm")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent
          placement="sheet"
          className="flex flex-col gap-0 overflow-hidden p-0 sm:p-0"
        >
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
            <DialogTitle>
              {editor.id ? t("editTitle") : t("createTitle")}
            </DialogTitle>
            <DialogDescription>{t("formHint")}</DialogDescription>
          </DialogHeader>

          <nav
            aria-label={t("formHint")}
            className="scrollbar-overlay shrink-0 overflow-x-auto border-b border-border px-3 py-2 sm:px-5"
          >
            <ul className="flex min-w-max gap-1.5">
              {FORM_SECTIONS.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => jumpToSection(section.id)}
                    className="rounded-full border border-border bg-background/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {t(`sections.${section.key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div
            ref={formScrollRef}
            className="scrollbar-overlay min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
          >
            <section id="svc-sec-identity" className="space-y-3 scroll-mt-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {t("sections.identity")}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={t("fields.reference")} id="svc-ref">
                  <Input
                    id="svc-ref"
                    value={editor.reference}
                    onChange={(e) =>
                      setEditor((p) => ({ ...p, reference: e.target.value }))
                    }
                    placeholder="VZ—WEB"
                  />
                </FormField>
                <FormField
                  label={t("fields.slug")}
                  id="svc-slug"
                  hint={
                    editor.slug
                      ? `/offres/${editor.slug.trim().toLowerCase()}`
                      : t("hints.slug")
                  }
                >
                  <Input
                    id="svc-slug"
                    value={editor.slug}
                    onChange={(e) =>
                      setEditor((p) => ({ ...p, slug: e.target.value }))
                    }
                    placeholder="sites-professionnels"
                  />
                </FormField>
                <FormField label={t("fields.icon")} id="svc-icon">
                  <Select
                    value={editor.icon}
                    onValueChange={(v) =>
                      setEditor((p) => ({ ...p, icon: v }))
                    }
                  >
                    <SelectTrigger id="svc-icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_ICON_KEYS.map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t("fields.status")} id="svc-status">
                  <Select
                    value={editor.status}
                    onValueChange={(v) =>
                      setEditor((p) => ({
                        ...p,
                        status: v as ServiceStatus,
                      }))
                    }
                  >
                    <SelectTrigger id="svc-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t("fields.sortOrder")} id="svc-order">
                  <Input
                    id="svc-order"
                    type="number"
                    value={editor.sortOrder}
                    onChange={(e) =>
                      setEditor((p) => ({
                        ...p,
                        sortOrder: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </FormField>
              </div>
            </section>

            <section id="svc-sec-commerce" className="space-y-3 scroll-mt-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {t("sections.commerce")}
              </h3>
              <label className="flex min-h-10 items-center gap-2 text-sm text-foreground/85">
                <input
                  type="checkbox"
                  checked={editor.showCtaStart}
                  onChange={(e) =>
                    setEditor((p) => ({
                      ...p,
                      showCtaStart: e.target.checked,
                    }))
                  }
                />
                {t("fields.showCtaStart")}
              </label>
            </section>

            <section id="svc-sec-pricing" className="space-y-3 scroll-mt-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {t("sections.pricing")}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={t("fields.pricingMode")} id="svc-mode">
                  <Select
                    value={editor.pricingMode}
                    onValueChange={(v) =>
                      setEditor((p) => ({
                        ...p,
                        pricingMode: v as ServicePricingMode,
                      }))
                    }
                  >
                    <SelectTrigger id="svc-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_PRICING_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {t(`pricingMode.${m}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t("fields.currency")} id="svc-currency">
                  <Select
                    value={editor.currency}
                    onValueChange={(v) =>
                      setEditor((p) => ({
                        ...p,
                        currency: v as EditorState["currency"],
                      }))
                    }
                  >
                    <SelectTrigger id="svc-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                {editor.pricingMode === "starting_at" ||
                editor.pricingMode === "fixed" ? (
                  <FormField
                    label={
                      editor.pricingMode === "fixed"
                        ? t("fields.fixedPrice")
                        : t("fields.startingPrice")
                    }
                    id="svc-price"
                  >
                    <Input
                      id="svc-price"
                      inputMode="decimal"
                      value={editor.startingPriceEuros}
                      onChange={(e) =>
                        setEditor((p) => ({
                          ...p,
                          startingPriceEuros: e.target.value,
                        }))
                      }
                      placeholder="900"
                    />
                  </FormField>
                ) : null}
                <FormField
                  label={t("fields.inquiryType")}
                  id="svc-inquiry"
                >
                  <Select
                    value={editor.inquiryProjectType || "__none__"}
                    onValueChange={(v) =>
                      setEditor((p) => ({
                        ...p,
                        inquiryProjectType: v === "__none__" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger id="svc-inquiry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t("inquiryNone")}</SelectItem>
                      {PROJECT_INQUIRY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </section>

            <section id="svc-sec-texts" className="space-y-3 scroll-mt-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {t("sections.texts")}
              </h3>
              <div className="flex gap-2 border-b border-border pb-2">
                {(["fr", "en", "ar"] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocaleTab(loc)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wider",
                      localeTab === loc
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/60 hover:text-foreground"
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              <div
                className="space-y-3"
                dir={localeTab === "ar" ? "rtl" : "ltr"}
              >
                <FormField label={t("fields.title")} id={`title-${localeTab}`}>
                  <Input
                    id={`title-${localeTab}`}
                    value={editor.title[localeTab]}
                    onChange={(e) =>
                      setEditor((p) => ({
                        ...p,
                        title: { ...p.title, [localeTab]: e.target.value },
                      }))
                    }
                  />
                </FormField>
                <FormField
                  label={t("fields.shortDescription")}
                  id={`short-${localeTab}`}
                >
                  <textarea
                    id={`short-${localeTab}`}
                    className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={editor.shortDescription[localeTab]}
                    maxLength={SERVICE_LIMITS.shortDescriptionMax}
                    onChange={(e) =>
                      setEditor((p) => ({
                        ...p,
                        shortDescription: {
                          ...p.shortDescription,
                          [localeTab]: e.target.value,
                        },
                      }))
                    }
                  />
                </FormField>
                <FormField
                  label={t("fields.description")}
                  id={`desc-${localeTab}`}
                >
                  <textarea
                    id={`desc-${localeTab}`}
                    className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={editor.description[localeTab]}
                    maxLength={SERVICE_LIMITS.descriptionMax}
                    onChange={(e) =>
                      setEditor((p) => ({
                        ...p,
                        description: {
                          ...p.description,
                          [localeTab]: e.target.value,
                        },
                      }))
                    }
                  />
                </FormField>
                <FormField
                  label={t("fields.idealFor")}
                  id={`ideal-${localeTab}`}
                >
                  <textarea
                    id={`ideal-${localeTab}`}
                    className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={editor.idealFor[localeTab]}
                    onChange={(e) =>
                      setEditor((p) => ({
                        ...p,
                        idealFor: {
                          ...p.idealFor,
                          [localeTab]: e.target.value,
                        },
                      }))
                    }
                  />
                </FormField>
                <FormField
                  label={t("fields.ctaLabel")}
                  id={`cta-${localeTab}`}
                >
                  <Input
                    id={`cta-${localeTab}`}
                    value={editor.ctaLabel[localeTab]}
                    onChange={(e) =>
                      setEditor((p) => ({
                        ...p,
                        ctaLabel: {
                          ...p.ctaLabel,
                          [localeTab]: e.target.value,
                        },
                      }))
                    }
                    placeholder={t("ctaPlaceholder")}
                  />
                </FormField>
              </div>
            </section>

            <section id="svc-sec-features" className="space-y-3 scroll-mt-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                  {t("sections.features")}
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setEditor((p) => ({
                      ...p,
                      includedFeatures: [
                        ...p.includedFeatures,
                        emptyI18n(),
                      ],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  {t("addFeature")}
                </Button>
              </div>
              {editor.includedFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-3 space-y-2"
                  dir={localeTab === "ar" ? "rtl" : "ltr"}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="rounded border border-border p-1"
                        onClick={() => moveFeature(index, -1)}
                        aria-label={t("moveUp")}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded border border-border p-1"
                        onClick={() => moveFeature(index, 1)}
                        aria-label={t("moveDown")}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded border border-border p-1"
                        onClick={() =>
                          setEditor((p) => ({
                            ...p,
                            includedFeatures: p.includedFeatures.filter(
                              (_, i) => i !== index
                            ),
                          }))
                        }
                        aria-label={t("removeFeature")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {(["fr", "en", "ar"] as const).map((loc) => (
                    <Input
                      key={loc}
                      value={feature[loc]}
                      placeholder={`${loc.toUpperCase()}`}
                      dir={loc === "ar" ? "rtl" : "ltr"}
                      onChange={(e) =>
                        setEditor((p) => {
                          const next = [...p.includedFeatures];
                          next[index] = {
                            ...next[index],
                            [loc]: e.target.value,
                          };
                          return { ...p, includedFeatures: next };
                        })
                      }
                    />
                  ))}
                </div>
              ))}
            </section>

            <section id="svc-sec-caseStudies" className="space-y-3 scroll-mt-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {t("sections.caseStudies")}
              </h3>
              <p className="text-xs text-foreground/50">{t("caseStudiesHint")}</p>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <FormField
                  label={t("fields.projectUrl")}
                  id="svc-project-url"
                  hint={t("hints.projectUrl")}
                >
                  <Input
                    id="svc-project-url"
                    value={projectRefInput}
                    onChange={(e) => {
                      setProjectRefInput(e.target.value);
                      setProjectLinkError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCaseStudyFromInput();
                      }
                    }}
                    placeholder="/projets/mon-projet"
                  />
                </FormField>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-10 w-full sm:w-auto"
                    onClick={addCaseStudyFromInput}
                  >
                    {t("addProject")}
                  </Button>
                </div>
              </div>

              {caseStudyOptions.length > 0 ? (
                <FormField label={t("fields.pickProject")} id="svc-pick-project">
                  <Select
                    value="__none__"
                    onValueChange={(v) => {
                      if (v && v !== "__none__") addCaseStudy(v);
                    }}
                  >
                    <SelectTrigger id="svc-pick-project">
                      <SelectValue placeholder={t("pickProjectPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">
                        {t("pickProjectPlaceholder")}
                      </SelectItem>
                      {caseStudyOptions
                        .filter(
                          (opt) =>
                            !editor.caseStudies.some(
                              (item) => item.projectId === opt.id
                            )
                        )
                        .map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.title}
                            {opt.slug ? ` · /projets/${opt.slug}` : ""}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormField>
              ) : (
                <p className="text-xs text-foreground/55">{t("noCaseStudies")}</p>
              )}

              {projectLinkError ? (
                <FormError message={projectLinkError} />
              ) : null}

              {editor.caseStudies.length === 0 ? (
                <p className="text-xs text-foreground/55">{t("noLinkedProjects")}</p>
              ) : (
                <ul className="space-y-3">
                  {editor.caseStudies.map((item, index) => {
                    const opt = caseStudyLabel.get(item.projectId);
                    return (
                      <li
                        key={item.projectId}
                        className="space-y-3 rounded-xl border border-border bg-surface-elevated/30 p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">
                              {opt?.title ?? item.projectId}
                            </p>
                            {opt?.slug ? (
                              <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
                                /projets/{opt.slug}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => moveCaseStudy(index, -1)}
                              disabled={index === 0}
                              aria-label={t("moveUp")}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => moveCaseStudy(index, 1)}
                              disabled={index === editor.caseStudies.length - 1}
                              aria-label={t("moveDown")}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                setEditor((p) => ({
                                  ...p,
                                  caseStudies: p.caseStudies.filter(
                                    (c) => c.projectId !== item.projectId
                                  ),
                                }))
                              }
                              aria-label={t("removeProject")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <FormField
                          label={t("fields.projectBlurb")}
                          id={`svc-blurb-${item.projectId}-${localeTab}`}
                        >
                          <Textarea
                            id={`svc-blurb-${item.projectId}-${localeTab}`}
                            className="min-h-20"
                            maxLength={SERVICE_LIMITS.caseStudyBlurbMax}
                            value={item.blurb[localeTab] ?? ""}
                            dir={localeTab === "ar" ? "rtl" : "ltr"}
                            placeholder={t("projectBlurbPlaceholder")}
                            onChange={(e) =>
                              setEditor((p) => ({
                                ...p,
                                caseStudies: p.caseStudies.map((c) =>
                                  c.projectId === item.projectId
                                    ? {
                                        ...c,
                                        blurb: {
                                          ...c.blurb,
                                          [localeTab]: e.target.value,
                                        },
                                      }
                                    : c
                                ),
                              }))
                            }
                          />
                        </FormField>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {submitError ? <FormError message={submitError} /> : null}
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:flex-wrap sm:px-6">
            {editor.id ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive hover:text-destructive sm:me-auto"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    {t("deleteConfirm")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteBody")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        void remove(editor.id!);
                      }}
                    >
                      {t("deleteConfirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditorOpen(false)}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => save(false)}
              loading={loading}
            >
              {!loading && <Save className="h-4 w-4" />}
              {t("saveDraft")}
            </Button>
            <Button
              type="button"
              onClick={() => save(true)}
              disabled={loading}
            >
              {t("savePublish")}
            </Button>
            {editor.id ? (
              <Button type="button" variant="ghost" asChild>
                <a
                  href={`${ADMIN_ROUTES.services}/preview/${editor.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  {t("preview")}
                </a>
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: ServiceStatus;
  t: ReturnType<typeof useTranslations>;
}) {
  const tone =
    status === "published"
      ? "border-primary/30 text-primary"
      : status === "archived"
        ? "border-border text-foreground/45"
        : "border-amber-500/30 text-amber-200/80";
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
        tone
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}

function safeT(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string
): string {
  try {
    const hasFn = (t as { has?: (k: string) => boolean }).has;
    if (typeof hasFn === "function" && !hasFn(key)) return fallback;
    return t(key);
  } catch {
    return fallback;
  }
}

function translateErr(
  code: string,
  tErrors: ReturnType<typeof useTranslations>
): string {
  const hasFn = (tErrors as { has?: (k: string) => boolean }).has;
  try {
    if (typeof hasFn === "function" && !hasFn(code)) {
      return tErrors("generic");
    }
    return tErrors(code);
  } catch {
    return tErrors("generic");
  }
}

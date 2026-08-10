"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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
  SERVICE_OFFER_KINDS,
  SERVICE_PRICING_MODES,
  SERVICE_STATUSES,
  parseServiceWriteBody,
  slugifyServiceTitle,
  type ServiceOfferKind,
  type ServicePricingMode,
  type ServiceStatus,
} from "@/lib/services/schema";
import {
  centsToEurosInput,
  parseEurosToCents,
} from "@/lib/services/pricing";
import type { ServiceI18n, ServiceRow } from "@/lib/services/store";
import { cn } from "@/lib/utils";
import { useSubmitGuard } from "@/hooks/use-submit-guard";

type LocaleTab = keyof ServiceI18n;

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
  featured: boolean;
  sortOrder: number;
  title: ServiceI18n;
  shortDescription: ServiceI18n;
  description: ServiceI18n;
  idealFor: ServiceI18n;
  includedFeatures: ServiceI18n[];
  ctaLabel: ServiceI18n;
  offerKind: ServiceOfferKind;
  showCtaBuy: boolean;
  showCtaStart: boolean;
  coverImage: string;
  linkedProjectId: string;
  pricingMode: ServicePricingMode;
  startingPriceEuros: string;
  currency: (typeof SERVICE_CURRENCIES)[number];
  inquiryProjectType: string;
  caseStudyIds: string[];
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
    featured: false,
    sortOrder: 0,
    title: emptyI18n(),
    shortDescription: emptyI18n(),
    description: emptyI18n(),
    idealFor: emptyI18n(),
    includedFeatures: [],
    ctaLabel: emptyI18n(),
    offerKind: "service",
    showCtaBuy: false,
    showCtaStart: true,
    coverImage: "",
    linkedProjectId: "",
    pricingMode: "quote_only",
    startingPriceEuros: "",
    currency: "EUR",
    inquiryProjectType: "",
    caseStudyIds: [],
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
    featured: row.featured,
    sortOrder: row.sort_order,
    title: { ...row.title },
    shortDescription: { ...row.short_description },
    description: { ...row.description },
    idealFor: { ...row.ideal_for },
    includedFeatures: row.included_features.map((f) => ({ ...f })),
    ctaLabel: { ...row.cta_label },
    offerKind: row.offer_kind,
    showCtaBuy: row.show_cta_buy,
    showCtaStart: row.show_cta_start,
    coverImage: row.cover_image ?? "",
    linkedProjectId: row.linked_project_id ?? "",
    pricingMode: row.pricing_mode,
    startingPriceEuros: centsToEurosInput(row.starting_price_cents),
    currency: row.currency,
    inquiryProjectType: row.inquiry_project_type ?? "",
    caseStudyIds: [...row.case_study_ids],
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
    featured: editor.featured,
    sortOrder: editor.sortOrder,
    title: editor.title,
    shortDescription: editor.shortDescription,
    description: editor.description,
    idealFor: editor.idealFor,
    includedFeatures: editor.includedFeatures.filter((f) => f.fr.trim()),
    ctaLabel: editor.ctaLabel,
    offerKind: editor.offerKind,
    showCtaBuy: editor.showCtaBuy,
    showCtaStart: editor.showCtaStart,
    coverImage: editor.coverImage.trim() || null,
    linkedProjectId: editor.linkedProjectId.trim() || null,
    pricingMode: editor.pricingMode,
    startingPriceCents,
    currency: editor.currency,
    inquiryProjectType: editor.inquiryProjectType || null,
    caseStudyIds: editor.caseStudyIds,
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
  const [uploadingCover, setUploadingCover] = useState(false);

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
    setEditorOpen(true);
  };

  const openEdit = (row: ServiceRow) => {
    setEditor(rowToEditor(row));
    setLocaleTab("fr");
    setSubmitError(null);
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

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/projects/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        url?: string;
        error?: string;
        code?: string;
      } | null;
      if (!res.ok || !body?.url) {
        setSubmitError(
          readAdminApiError(res, body, tErrors("generic"), (key) =>
            tErrors(key)
          )
        );
        return;
      }
      setEditor((p) => ({ ...p, coverImage: body.url! }));
    } catch {
      setSubmitError(tErrors("generic"));
    } finally {
      setUploadingCover(false);
    }
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

  const remove = async (id: string) => {
    if (!trySubmit()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setListError(t("deleteError"));
        return;
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const moveOrder = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= services.length) return;
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

      {listError ? <FormError message={listError} /> : null}

      {services.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-foreground/55">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid gap-3 sm:gap-4">
          {services.map((row, index) => {
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
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/75">
                        {row.reference}
                      </span>
                      <StatusBadge status={row.status} t={t} />
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/70">
                        {t(`offerKind.${row.offer_kind}`)}
                      </span>
                      {row.featured ? (
                        <span className="rounded-full border border-border-gold/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary/80">
                          {t("cols.featured")}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="truncate font-display text-lg font-semibold text-foreground">
                      {name}
                    </h3>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-foreground/60 sm:grid-cols-3">
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
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
                          {t("cols.order")}
                        </dt>
                        <dd className="mt-1 flex items-center gap-1">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:border-primary/40 disabled:opacity-40"
                            onClick={() => moveOrder(index, -1)}
                            aria-label={t("moveUp")}
                            disabled={loading || index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:border-primary/40 disabled:opacity-40"
                            onClick={() => moveOrder(index, 1)}
                            aria-label={t("moveDown")}
                            disabled={loading || index === services.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
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
                      >
                        {t("unpublish")}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="min-h-10"
                        onClick={() => patchStatus(row.id, "published")}
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
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      <span className="sm:inline">
                        {safeT(t, "duplicate", "Dupliquer")}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="min-h-10"
                      onClick={() => patchStatus(row.id, "archived")}
                    >
                      <Archive className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">
                        {safeT(t, "archive", "Archiver")}
                      </span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="min-h-10"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          <span className="sr-only">{t("deleteConfirm")}</span>
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
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[min(92dvh,900px)] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {editor.id ? t("editTitle") : t("createTitle")}
            </DialogTitle>
            <DialogDescription>{t("formHint")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <section className="space-y-3">
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
                <FormField label={t("fields.slug")} id="svc-slug">
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
                <label className="flex items-center gap-2 text-sm self-end pb-2">
                  <input
                    type="checkbox"
                    checked={editor.featured}
                    onChange={(e) =>
                      setEditor((p) => ({ ...p, featured: e.target.checked }))
                    }
                  />
                  {t("fields.featured")}
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {t("sections.commerce")}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={t("fields.offerKind")} id="svc-kind">
                  <Select
                    value={editor.offerKind}
                    onValueChange={(v) => {
                      const kind = v as ServiceOfferKind;
                      setEditor((p) => ({
                        ...p,
                        offerKind: kind,
                        showCtaBuy:
                          kind === "product" ? true : p.showCtaBuy,
                        showCtaStart:
                          kind === "service" ? true : p.showCtaStart,
                        pricingMode:
                          kind === "product" &&
                          (p.pricingMode === "quote_only" ||
                            p.pricingMode === "contact")
                            ? "fixed"
                            : p.pricingMode,
                      }));
                    }}
                  >
                    <SelectTrigger id="svc-kind">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_OFFER_KINDS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {t(`offerKind.${k}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <div className="flex flex-col justify-end gap-2 sm:col-span-1">
                  <label className="flex min-h-10 items-center gap-2 text-sm text-foreground/85">
                    <input
                      type="checkbox"
                      checked={editor.showCtaBuy}
                      onChange={(e) =>
                        setEditor((p) => ({
                          ...p,
                          showCtaBuy: e.target.checked,
                        }))
                      }
                    />
                    {t("fields.showCtaBuy")}
                  </label>
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
                </div>
              </div>
              <p className="text-xs text-foreground/50">{t("commerceHint")}</p>

              <FormField
                label={t("fields.coverImage")}
                id="svc-cover"
                hint={t("hints.coverImage")}
              >
                <div className="space-y-3">
                  {editor.coverImage ? (
                    <div className="relative overflow-hidden rounded-lg border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editor.coverImage}
                        alt=""
                        className="aspect-[16/10] w-full object-cover"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="absolute end-2 top-2"
                        disabled={loading || uploadingCover}
                        onClick={() =>
                          setEditor((p) => ({ ...p, coverImage: "" }))
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        {t("removeCover")}
                      </Button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={loading || uploadingCover}
                        asChild
                      >
                        <span>
                          {uploadingCover ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                          )}
                          {t("uploadCover")}
                        </span>
                      </Button>
                      <input
                        id="svc-cover"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={loading || uploadingCover}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) void uploadCover(file);
                        }}
                      />
                    </label>
                    <Input
                      value={editor.coverImage}
                      onChange={(e) =>
                        setEditor((p) => ({
                          ...p,
                          coverImage: e.target.value,
                        }))
                      }
                      placeholder="https://…"
                      className="min-w-[12rem] flex-1"
                      disabled={loading || uploadingCover}
                    />
                  </div>
                </div>
              </FormField>
            </section>

            <section className="space-y-3">
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

            <section className="space-y-3">
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

            <section className="space-y-3">
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

            <section className="space-y-3">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {t("sections.caseStudies")}
              </h3>

              <FormField
                label={t("fields.linkedProject")}
                id="svc-linked-project"
                hint={t("hints.linkedProject")}
              >
                <Select
                  value={editor.linkedProjectId || "__none__"}
                  onValueChange={(v) =>
                    setEditor((p) => ({
                      ...p,
                      linkedProjectId: v === "__none__" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger id="svc-linked-project">
                    <SelectValue placeholder={t("linkedProjectNone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      {t("linkedProjectNone")}
                    </SelectItem>
                    {caseStudyOptions
                      .filter((opt) => opt.published)
                      .map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.title}
                          {opt.reference ? ` · ${opt.reference}` : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormField>

              <p className="text-xs text-foreground/50">{t("caseStudiesHint")}</p>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                {caseStudyOptions.length === 0 ? (
                  <p className="text-xs text-foreground/55">{t("noCaseStudies")}</p>
                ) : (
                  caseStudyOptions.map((opt) => {
                    const checked = editor.caseStudyIds.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setEditor((p) => ({
                              ...p,
                              caseStudyIds: e.target.checked
                                ? [...p.caseStudyIds, opt.id]
                                : p.caseStudyIds.filter((id) => id !== opt.id),
                            }));
                          }}
                        />
                        <span>
                          <span className="font-medium">
                            {opt.title}
                          </span>
                          {opt.reference ? (
                            <span className="ms-2 font-mono text-[10px] text-muted-foreground">
                              {opt.reference}
                            </span>
                          ) : null}
                          {!opt.published ? (
                            <span className="ms-2 text-[10px] text-amber-500/80">
                              ({t("status.draft")})
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              {editor.caseStudyIds.length > 0 ? (
                <p className="text-xs text-foreground/55">
                  {editor.caseStudyIds
                    .map((id) => caseStudyLabel.get(id)?.title ?? id)
                    .join(" · ")}
                </p>
              ) : null}
            </section>

            {submitError ? <FormError message={submitError} /> : null}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
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

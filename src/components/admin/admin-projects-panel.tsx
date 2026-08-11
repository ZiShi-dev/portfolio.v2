"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FolderKanban,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
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
import { PROJECT_BUSINESS_TYPES } from "@/data/project-business-type-icons";
import {
  PROJECT_LIMITS,
  parseProjectWriteBody,
  type ProjectKind,
} from "@/lib/projects/schema";
import { resolveProjectSlug, slugifyProjectTitle } from "@/lib/projects/slug";
import type { ProjectI18n, ProjectRow } from "@/lib/projects/store";
import { cn } from "@/lib/utils";
import { useSubmitGuard } from "@/hooks/use-submit-guard";

type LocaleTab = keyof ProjectI18n;

type EditorState = {
  id?: string;
  slug: string;
  reference: string;
  title: ProjectI18n;
  description: ProjectI18n;
  kind: ProjectKind;
  businessTypeIds: string[];
  images: { url: string; label?: Partial<ProjectI18n> }[];
  coverImage: string;
  link: string;
  appLink: string;
  sortOrder: number;
  published: boolean;
  featured: boolean;
  technologies: string[];
  features: ProjectI18n[];
  clientNeed: ProjectI18n;
  objective: ProjectI18n;
  solution: ProjectI18n;
  result: ProjectI18n;
  seoTitle: ProjectI18n;
  seoDescription: ProjectI18n;
};

const emptyI18n = (): ProjectI18n => ({ fr: "", en: "", ar: "" });

function emptyEditor(): EditorState {
  return {
    slug: "",
    reference: "",
    title: emptyI18n(),
    description: emptyI18n(),
    kind: "personal",
    businessTypeIds: [],
    images: [],
    coverImage: "",
    link: "",
    appLink: "",
    sortOrder: 0,
    published: false,
    featured: false,
    technologies: [],
    features: [],
    clientNeed: emptyI18n(),
    objective: emptyI18n(),
    solution: emptyI18n(),
    result: emptyI18n(),
    seoTitle: emptyI18n(),
    seoDescription: emptyI18n(),
  };
}

function rowToEditor(row: ProjectRow): EditorState {
  return {
    id: row.id,
    slug: row.slug,
    reference: row.reference ?? "",
    title: { ...row.title },
    description: { ...row.description },
    kind: row.kind,
    businessTypeIds: [...row.business_type_ids],
    images: row.images.map((img) => ({
      url: img.url,
      label: img.label ? { ...img.label } : undefined,
    })),
    coverImage: row.cover_image ?? "",
    link: row.link ?? "",
    appLink: row.app_link ?? "",
    sortOrder: row.sort_order,
    published: row.published,
    featured: row.featured,
    technologies: [...row.technologies],
    features: row.features.map((f) => ({ ...f })),
    clientNeed: { ...row.client_need },
    objective: { ...row.objective },
    solution: { ...row.solution },
    result: { ...row.result },
    seoTitle: { ...row.seo_title },
    seoDescription: { ...row.seo_description },
  };
}

type ListResponse = {
  ok?: boolean;
  configured?: boolean;
  projects?: ProjectRow[];
  error?: string;
  code?: string;
};

type AdminProjectsPanelProps = {
  initialProjects?: ProjectRow[];
  initialConfigured?: boolean;
};

type FieldKey =
  | "title"
  | "description"
  | "slug"
  | "link"
  | "appLink"
  | "images"
  | "businessTypes"
  | "sortOrder";

type FieldErrors = Partial<Record<FieldKey, string>>;

const ERROR_CODE_TO_FIELD: Record<string, FieldKey> = {
  project_invalid_title: "title",
  project_invalid_description: "description",
  project_invalid_slug: "slug",
  invalid_slug: "slug",
  duplicate_slug: "slug",
  project_invalid_link: "link",
  project_invalid_app_link: "appLink",
  project_invalid_images: "images",
  project_invalid_image: "images",
  project_invalid_business_types: "businessTypes",
  project_too_many_business_types: "businessTypes",
  invalid_business_type: "businessTypes",
  duplicate_business_type: "businessTypes",
};

function translateErrorCode(
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

function fieldErrorsFromCode(
  code: string,
  tErrors: ReturnType<typeof useTranslations>
): { fieldErrors: FieldErrors; submitError: string } {
  const field = ERROR_CODE_TO_FIELD[code];
  const message = translateErrorCode(code, tErrors);
  if (field) return { fieldErrors: { [field]: message }, submitError: "" };
  return { fieldErrors: {}, submitError: message };
}

function translateAdminError(
  res: Response,
  body: { error?: string; code?: string } | null,
  tErrors: ReturnType<typeof useTranslations>
): string {
  const detail = body?.error?.trim();
  const hasFn = (tErrors as { has?: (k: string) => boolean }).has;
  if (
    detail &&
    detail !== "invalid_request" &&
    typeof hasFn === "function" &&
    hasFn(detail)
  ) {
    return tErrors(detail);
  }
  return readAdminApiError(res, body, tErrors("generic"), (key) => {
    try {
      if (typeof hasFn === "function" && !hasFn(key)) {
        return tErrors("generic");
      }
      return tErrors(key);
    } catch {
      return tErrors("generic");
    }
  });
}

export function AdminProjectsPanel({
  initialProjects,
  initialConfigured = true,
}: AdminProjectsPanelProps = {}) {
  const t = useTranslations("admin.projects");
  const tErrors = useTranslations("admin.errors");
  const [configured, setConfigured] = useState(initialConfigured);
  const [projects, setProjects] = useState<ProjectRow[]>(
    initialProjects ?? []
  );
  const [loading, setLoading] = useState(initialProjects === undefined);
  const [loadError, setLoadError] = useState("");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [localeTab, setLocaleTab] = useState<LocaleTab>("fr");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [techDraft, setTechDraft] = useState("");
  const { loading: saving, setLoading: setSaving, trySubmit } =
    useSubmitGuard();

  function clearFieldError(key: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function applyApiError(body: { error?: string; code?: string } | null, res: Response) {
    const detail = body?.error?.trim();
    if (detail && detail in ERROR_CODE_TO_FIELD) {
      const mapped = fieldErrorsFromCode(detail, tErrors);
      setFieldErrors(mapped.fieldErrors);
      setSubmitError(mapped.submitError);
      if (mapped.fieldErrors.title || mapped.fieldErrors.description) {
        setLocaleTab("fr");
      }
      return;
    }
    setFieldErrors({});
    setSubmitError(translateAdminError(res, body, tErrors));
  }

  const load = useCallback(
    async (opts?: { signal?: AbortSignal; soft?: boolean }) => {
      if (!opts?.soft) setLoading(true);
      setLoadError("");
      try {
        const res = await fetch("/api/admin/projects", {
          credentials: "same-origin",
          cache: "no-store",
          signal: opts?.signal,
        });
        if (opts?.signal?.aborted) return;
        const body = (await res.json().catch(() => null)) as ListResponse | null;
        if (!res.ok) {
          setLoadError(translateAdminError(res, body, tErrors));
          return;
        }
        setConfigured(body?.configured !== false);
        setProjects(body?.projects ?? []);
      } catch (err) {
        if (opts?.signal?.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(tErrors("generic"));
      } finally {
        if (!opts?.signal?.aborted) setLoading(false);
      }
    },
    [tErrors]
  );

  useEffect(() => {
    if (initialProjects !== undefined) return;
    const ac = new AbortController();
    const frame = window.requestAnimationFrame(() => {
      void load({ signal: ac.signal });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      ac.abort();
    };
  }, [initialProjects, load]);

  const editorPayload = useMemo(() => {
    if (!editor) return null;
    const fillFromFr = (i18n: ProjectI18n): ProjectI18n => ({
      fr: i18n.fr.trim(),
      en: i18n.en.trim() || i18n.fr.trim(),
      ar: i18n.ar.trim() || i18n.fr.trim(),
    });
    const fillOptional = (i18n: ProjectI18n): ProjectI18n => ({
      fr: i18n.fr.trim(),
      en: i18n.en.trim(),
      ar: i18n.ar.trim(),
    });
    const title = fillFromFr(editor.title);
    return {
      slug: resolveProjectSlug(editor.slug, title.fr),
      title,
      description: fillFromFr(editor.description),
      kind: editor.kind,
      businessTypeIds: editor.businessTypeIds,
      images: editor.images.map((img) => ({
        url: img.url,
        ...(img.label ? { label: img.label } : {}),
      })),
      link: editor.link.trim() || null,
      appLink: editor.appLink.trim() || null,
      sortOrder: editor.sortOrder,
      published: editor.published,
      featured: editor.featured,
      coverImage: editor.coverImage.trim() || null,
      technologies: editor.technologies,
      features: editor.features
        .filter((f) => f.fr.trim())
        .map((f) => ({
          fr: f.fr.trim(),
          en: f.en.trim() || f.fr.trim(),
          ar: f.ar.trim() || f.fr.trim(),
        })),
      clientNeed: fillOptional(editor.clientNeed),
      objective: fillOptional(editor.objective),
      solution: fillOptional(editor.solution),
      result: fillOptional(editor.result),
      seoTitle: fillOptional(editor.seoTitle),
      seoDescription: fillOptional(editor.seoDescription),
      ...(editor.reference.trim()
        ? { reference: editor.reference.trim() }
        : {}),
    };
  }, [editor]);

  function openNew() {
    setEditor(emptyEditor());
    setLocaleTab("fr");
    setFieldErrors({});
    setSubmitError("");
    setSuccessMessage("");
  }

  function openEdit(row: ProjectRow) {
    setEditor(rowToEditor(row));
    setLocaleTab("fr");
    setFieldErrors({});
    setSubmitError("");
    setSuccessMessage("");
  }

  function closeModal() {
    setEditor(null);
    setFieldErrors({});
    setSubmitError("");
    setSuccessMessage("");
  }

  async function save() {
    if (!editor || !editorPayload) return;
    setFieldErrors({});
    setSubmitError("");
    setSuccessMessage("");

    const local = parseProjectWriteBody(editorPayload);
    if (!local.ok) {
      const mapped = fieldErrorsFromCode(local.error, tErrors);
      setFieldErrors(mapped.fieldErrors);
      setSubmitError(mapped.submitError);
      if (mapped.fieldErrors.title || mapped.fieldErrors.description) {
        setLocaleTab("fr");
      }
      return;
    }

    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") setSubmitError(tErrors("cooldown"));
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(editor.id);
      const res = await fetch(
        isEdit ? `/api/admin/projects/${editor.id}` : "/api/admin/projects",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(editorPayload),
        }
      );
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        code?: string;
        project?: ProjectRow;
      } | null;
      if (!res.ok) {
        applyApiError(body, res);
        return;
      }
      setSuccessMessage(t("saved"));
      closeModal();
      await load();
    } catch {
      setSubmitError(tErrors("generic"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setSubmitError("");
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        code?: string;
        error?: string;
      } | null;
      setSubmitError(translateAdminError(res, body, tErrors));
      return;
    }
    closeModal();
    await load();
  }

  async function onUpload(fileList: FileList | null) {
    if (!fileList?.length || !editor) return;
    const file = fileList[0];
    if (!file) return;
    setUploading(true);
    clearFieldError("images");
    setSubmitError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/projects/upload", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const body = (await res.json().catch(() => null)) as {
        url?: string;
        code?: string;
        error?: string;
      } | null;
      if (!res.ok || !body?.url) {
        const detail = body?.error?.trim();
        if (detail && detail in ERROR_CODE_TO_FIELD) {
          applyApiError(body, res);
        } else {
          setFieldErrors({
            images: translateAdminError(res, body, tErrors),
          });
        }
        return;
      }
      setEditor({
        ...editor,
        images: [...editor.images, { url: body.url }],
      });
    } catch {
      setFieldErrors({ images: tErrors("generic") });
    } finally {
      setUploading(false);
    }
  }

  function moveImage(index: number, dir: -1 | 1) {
    if (!editor) return;
    const next = index + dir;
    if (next < 0 || next >= editor.images.length) return;
    const images = [...editor.images];
    const tmp = images[index]!;
    images[index] = images[next]!;
    images[next] = tmp;
    setEditor({ ...editor, images });
  }

  function toggleBusinessType(id: string) {
    if (!editor) return;
    clearFieldError("businessTypes");
    const has = editor.businessTypeIds.includes(id);
    if (has) {
      setEditor({
        ...editor,
        businessTypeIds: editor.businessTypeIds.filter((typeId) => typeId !== id),
      });
      return;
    }
    if (editor.businessTypeIds.length >= PROJECT_LIMITS.maxBusinessTypes) {
      setFieldErrors((prev) => ({
        ...prev,
        businessTypes: t("businessTypesMax", {
          max: PROJECT_LIMITS.maxBusinessTypes,
        }),
      }));
      return;
    }
    setEditor({
      ...editor,
      businessTypeIds: [...editor.businessTypeIds, id],
    });
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label={t("loading")}>
        <div className="h-10 w-36 animate-pulse rounded-full bg-muted" />
        <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={`skel-${i}`}
              className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-40 max-w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 max-w-full animate-pulse rounded bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <FormError message={loadError} />
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => void load()}
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FolderKanban className="h-5 w-5 text-primary" aria-hidden />
          {t("notConfiguredTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-foreground/65">
          {t("notConfiguredBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground/80">
          {t("listTitle")}
          {projects.length > 0 ? (
            <span className="ms-2 text-foreground/45">({projects.length})</span>
          ) : null}
        </h2>
        <Button type="button" size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" aria-hidden />
          {t("new")}
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-foreground/55">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const cover = p.images[0]?.url;
            const name = p.title.fr || p.slug;
            return (
              <li key={p.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="group block w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card text-start transition-colors hover:border-primary/35"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-foreground/40">
                        {t("noCover")}
                      </div>
                    )}
                    <span
                      className={cn(
                        "absolute start-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        p.published
                          ? "bg-primary/90 text-primary-foreground"
                          : "bg-background/85 text-foreground/60"
                      )}
                    >
                      {p.published ? t("published") : t("draft")}
                    </span>
                  </div>
                  <div className="min-w-0 p-4">
                    {p.reference ? (
                      <p className="truncate font-mono text-[10px] tracking-[0.16em] text-primary/80">
                        {p.reference}
                      </p>
                    ) : null}
                    <p className="truncate font-medium leading-snug">{name}</p>
                    <p className="mt-1 truncate text-xs text-foreground/50">
                      {p.kind === "sold" ? t("kindSold") : t("kindPersonal")}
                      {p.featured ? ` · ${t("featured")}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={Boolean(editor)}
        onOpenChange={(next) => {
          if (!next) closeModal();
        }}
      >
        {editor ? (
          <DialogContent
            className="flex max-h-[min(92dvh,52rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:p-0"
            closeLabel={t("cancel")}
          >
            <DialogHeader className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
              <DialogTitle>
                {editor.id ? t("editTitle") : t("createTitle")}
              </DialogTitle>
              <DialogDescription>{t("localeHint")}</DialogDescription>
            </DialogHeader>

            <div className="scrollbar-overlay min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                <div className="flex flex-wrap gap-2">
                  {(["fr", "en", "ar"] as const).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocaleTab(loc)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs uppercase tracking-wide",
                        localeTab === loc
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground/60"
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                <FormField
                  id="proj-title"
                  label={t("fields.title")}
                  required
                  error={fieldErrors.title}
                >
                  <Input
                    id="proj-title"
                    dir={localeTab === "ar" ? "rtl" : "ltr"}
                    aria-invalid={Boolean(fieldErrors.title)}
                    aria-describedby={
                      fieldErrors.title ? "proj-title-error" : undefined
                    }
                    value={editor.title[localeTab]}
                    onChange={(e) => {
                      clearFieldError("title");
                      const value = e.target.value;
                      const nextTitle = {
                        ...editor.title,
                        [localeTab]: value,
                      };
                      const prevAuto = slugifyProjectTitle(editor.title.fr);
                      const shouldAutoSlug =
                        !editor.id &&
                        localeTab === "fr" &&
                        (!editor.slug.trim() || editor.slug === prevAuto);
                      const nextSlug = slugifyProjectTitle(value);
                      setEditor({
                        ...editor,
                        title: nextTitle,
                        ...(shouldAutoSlug && nextSlug
                          ? { slug: nextSlug }
                          : {}),
                      });
                    }}
                  />
                </FormField>

                <FormField
                  id="proj-desc"
                  label={t("fields.description")}
                  required
                  error={fieldErrors.description}
                >
                  <textarea
                    id="proj-desc"
                    rows={4}
                    dir={localeTab === "ar" ? "rtl" : "ltr"}
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby={
                      fieldErrors.description ? "proj-desc-error" : undefined
                    }
                    value={editor.description[localeTab]}
                    onChange={(e) => {
                      clearFieldError("description");
                      setEditor({
                        ...editor,
                        description: {
                          ...editor.description,
                          [localeTab]: e.target.value,
                        },
                      });
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-step-accent/50"
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    id="proj-slug"
                    label={t("fields.slug")}
                    required
                    error={fieldErrors.slug}
                  >
                    <Input
                      id="proj-slug"
                      aria-invalid={Boolean(fieldErrors.slug)}
                      aria-describedby={
                        fieldErrors.slug ? "proj-slug-error" : undefined
                      }
                      value={editor.slug}
                      placeholder={t("slugPlaceholder")}
                      onChange={(e) => {
                        clearFieldError("slug");
                        setEditor({ ...editor, slug: e.target.value });
                      }}
                    />
                    <p className="text-xs text-foreground/45">{t("slugHint")}</p>
                  </FormField>
                  <FormField id="proj-kind" label={t("fields.kind")} required>
                    <Select
                      value={editor.kind}
                      onValueChange={(value) =>
                        setEditor({
                          ...editor,
                          kind: value as ProjectKind,
                        })
                      }
                    >
                      <SelectTrigger id="proj-kind" aria-label={t("fields.kind")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">
                          {t("kindPersonal")}
                        </SelectItem>
                        <SelectItem value="sold">{t("kindSold")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField
                    id="proj-sort"
                    label={t("fields.sortOrder")}
                    error={fieldErrors.sortOrder}
                  >
                    <Input
                      id="proj-sort"
                      type="number"
                      aria-invalid={Boolean(fieldErrors.sortOrder)}
                      value={editor.sortOrder}
                      onChange={(e) => {
                        clearFieldError("sortOrder");
                        setEditor({
                          ...editor,
                          sortOrder: Number(e.target.value) || 0,
                        });
                      }}
                    />
                  </FormField>
                  <FormField
                    id="proj-link"
                    label={t("fields.link")}
                    error={fieldErrors.link}
                  >
                    <Input
                      id="proj-link"
                      type="url"
                      placeholder="https://"
                      aria-invalid={Boolean(fieldErrors.link)}
                      aria-describedby={
                        fieldErrors.link ? "proj-link-error" : undefined
                      }
                      value={editor.link}
                      onChange={(e) => {
                        clearFieldError("link");
                        setEditor({ ...editor, link: e.target.value });
                      }}
                    />
                  </FormField>
                  <FormField
                    id="proj-app-link"
                    label={t("fields.appLink")}
                    hint={t("hints.appLink")}
                    error={fieldErrors.appLink}
                  >
                    <Input
                      id="proj-app-link"
                      type="url"
                      placeholder="https://play.google.com/… ou https://apps.apple.com/…"
                      aria-invalid={Boolean(fieldErrors.appLink)}
                      aria-describedby={
                        fieldErrors.appLink ? "proj-app-link-error" : undefined
                      }
                      value={editor.appLink}
                      onChange={(e) => {
                        clearFieldError("appLink");
                        setEditor({ ...editor, appLink: e.target.value });
                      }}
                    />
                  </FormField>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editor.published}
                    onChange={(e) =>
                      setEditor({ ...editor, published: e.target.checked })
                    }
                  />
                  {t("fields.published")}
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editor.featured}
                    onChange={(e) =>
                      setEditor({ ...editor, featured: e.target.checked })
                    }
                  />
                  {t("fields.featured")}
                </label>

                {editor.reference ? (
                  <p className="font-mono text-xs tracking-[0.16em] text-foreground/55">
                    {t("fields.reference")}: {editor.reference}
                  </p>
                ) : (
                  <p className="text-xs text-foreground/45">{t("referenceHint")}</p>
                )}

                <FormField
                  id="proj-client-need"
                  label={t("fields.clientNeed")}
                >
                  <textarea
                    id="proj-client-need"
                    rows={3}
                    dir={localeTab === "ar" ? "rtl" : "ltr"}
                    value={editor.clientNeed[localeTab]}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        clientNeed: {
                          ...editor.clientNeed,
                          [localeTab]: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-step-accent/50"
                  />
                </FormField>

                <FormField id="proj-objective" label={t("fields.objective")}>
                  <textarea
                    id="proj-objective"
                    rows={3}
                    dir={localeTab === "ar" ? "rtl" : "ltr"}
                    value={editor.objective[localeTab]}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        objective: {
                          ...editor.objective,
                          [localeTab]: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-step-accent/50"
                  />
                </FormField>

                <FormField id="proj-solution" label={t("fields.solution")}>
                  <textarea
                    id="proj-solution"
                    rows={3}
                    dir={localeTab === "ar" ? "rtl" : "ltr"}
                    value={editor.solution[localeTab]}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        solution: {
                          ...editor.solution,
                          [localeTab]: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-step-accent/50"
                  />
                </FormField>

                <FormField id="proj-result" label={t("fields.result")}>
                  <textarea
                    id="proj-result"
                    rows={3}
                    dir={localeTab === "ar" ? "rtl" : "ltr"}
                    value={editor.result[localeTab]}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        result: {
                          ...editor.result,
                          [localeTab]: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-step-accent/50"
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField id="proj-seo-title" label={t("fields.seoTitle")}>
                    <Input
                      id="proj-seo-title"
                      dir={localeTab === "ar" ? "rtl" : "ltr"}
                      value={editor.seoTitle[localeTab]}
                      onChange={(e) =>
                        setEditor({
                          ...editor,
                          seoTitle: {
                            ...editor.seoTitle,
                            [localeTab]: e.target.value,
                          },
                        })
                      }
                    />
                  </FormField>
                  <FormField
                    id="proj-seo-desc"
                    label={t("fields.seoDescription")}
                  >
                    <Input
                      id="proj-seo-desc"
                      dir={localeTab === "ar" ? "rtl" : "ltr"}
                      value={editor.seoDescription[localeTab]}
                      onChange={(e) =>
                        setEditor({
                          ...editor,
                          seoDescription: {
                            ...editor.seoDescription,
                            [localeTab]: e.target.value,
                          },
                        })
                      }
                    />
                  </FormField>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">{t("fields.features")}</p>
                  <ul className="space-y-2">
                    {editor.features.map((feature, index) => (
                      <li key={index} className="flex gap-2">
                        <Input
                          dir={localeTab === "ar" ? "rtl" : "ltr"}
                          value={feature[localeTab]}
                          placeholder={t("featurePlaceholder")}
                          onChange={(e) => {
                            const next = [...editor.features];
                            next[index] = {
                              ...next[index],
                              [localeTab]: e.target.value,
                            };
                            setEditor({ ...editor, features: next });
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditor({
                              ...editor,
                              features: editor.features.filter(
                                (_, i) => i !== index
                              ),
                            })
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      setEditor({
                        ...editor,
                        features: [...editor.features, emptyI18n()],
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    {t("addFeature")}
                  </Button>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">
                    {t("fields.technologies")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editor.technologies.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() =>
                          setEditor({
                            ...editor,
                            technologies: editor.technologies.filter(
                              (x) => x !== tech
                            ),
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-xs text-foreground/80 hover:border-destructive/40"
                      >
                        {tech}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={techDraft}
                      placeholder={t("techPlaceholder")}
                      onChange={(e) => setTechDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        const value = techDraft.trim();
                        if (!value) return;
                        if (editor.technologies.includes(value)) return;
                        setEditor({
                          ...editor,
                          technologies: [...editor.technologies, value],
                        });
                        setTechDraft("");
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const value = techDraft.trim();
                        if (!value) return;
                        if (editor.technologies.includes(value)) return;
                        setEditor({
                          ...editor,
                          technologies: [...editor.technologies, value],
                        });
                        setTechDraft("");
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium">
                    {t("fields.businessTypes")}
                  </p>
                  <p className="mb-2 text-xs text-foreground/45">
                    {t("businessTypesHint", {
                      max: PROJECT_LIMITS.maxBusinessTypes,
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_BUSINESS_TYPES.map((type) => {
                      const active = editor.businessTypeIds.includes(type.id);
                      const Icon = type.Icon;
                      const atMax =
                        !active &&
                        editor.businessTypeIds.length >=
                          PROJECT_LIMITS.maxBusinessTypes;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          disabled={atMax}
                          onClick={() => toggleBusinessType(type.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                            active
                              ? "border-primary/50 bg-primary/10 text-foreground"
                              : "border-border text-foreground/55 hover:border-foreground/25",
                            atMax && "cursor-not-allowed opacity-40"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                          {t(`businessTypes.${type.id}`)}
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.businessTypes ? (
                    <div className="mt-2">
                      <FormError
                        id="proj-business-types-error"
                        message={fieldErrors.businessTypes}
                      />
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{t("fields.images")}</p>
                    <label className="relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-border px-3 py-1.5 text-xs hover:border-foreground/25">
                      {uploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {t("upload")}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        disabled={uploading}
                        onChange={(e) => {
                          clearFieldError("images");
                          void onUpload(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  {editor.images.length === 0 ? (
                    <p className="text-xs text-foreground/50">
                      {t("imagesEmpty")}
                    </p>
                  ) : (
                    <ul className="min-w-0 space-y-2">
                      {editor.images.map((img, index) => (
                        <li
                          key={`${img.url}-${index}`}
                          className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-border p-2"
                        >
                          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={img.url}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <p className="min-w-0 flex-1 truncate text-xs text-foreground/55">
                            {img.url}
                          </p>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              className="rounded-md p-1 hover:bg-muted"
                              aria-label={t("moveUp")}
                              onClick={() => moveImage(index, -1)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-md p-1 hover:bg-muted"
                              aria-label={t("moveDown")}
                              onClick={() => moveImage(index, 1)}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-md p-1 text-destructive hover:bg-muted"
                              aria-label={t("removeImage")}
                              onClick={() => {
                                clearFieldError("images");
                                setEditor({
                                  ...editor,
                                  images: editor.images.filter(
                                    (_, i) => i !== index
                                  ),
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {fieldErrors.images ? (
                    <div className="mt-2">
                      <FormError
                        id="proj-images-error"
                        message={fieldErrors.images}
                      />
                    </div>
                  ) : null}
                </div>

                {submitError ? <FormError message={submitError} /> : null}
                {successMessage ? (
                  <p className="text-sm font-medium text-primary" role="status">
                    {successMessage}
                  </p>
                ) : null}
              </div>

              <DialogFooter className="shrink-0 flex-row flex-wrap justify-start gap-3 border-t border-border px-5 py-4 sm:justify-start sm:px-6">
                <Button
                  type="button"
                  loading={saving}
                  onClick={() => void save()}
                >
                  {saving ? (
                    t("saving")
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {t("save")}
                    </>
                  )}
                </Button>
                {editor.slug.trim() && editor.published ? (
                  <Button type="button" variant="outline" asChild>
                    <a
                      href={`/projets/${editor.slug.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("preview")}
                    </a>
                  </Button>
                ) : null}
                <Button type="button" variant="outline" onClick={closeModal}>
                  {t("cancel")}
                </Button>
                {editor.id ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("confirmDelete")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("confirmDeleteCancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void remove(editor.id!)}
                        >
                          {t("confirmDeleteAction")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

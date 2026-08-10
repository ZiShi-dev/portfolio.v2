"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Copy,
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
import {
  FAQ_SCOPES,
  FAQ_STATUSES,
  parseFaqWriteBody,
  type FaqScope,
  type FaqStatus,
} from "@/lib/faqs/schema";
import type { FaqI18n, FaqRow } from "@/lib/faqs/store";
import {
  getSubmitCooldownMessage,
  useSubmitGuard,
} from "@/hooks/use-submit-guard";

type LocaleTab = keyof FaqI18n;

type ServiceOption = {
  id: string;
  reference: string;
  title: string;
};

type ListFilter =
  | "all"
  | "published"
  | "draft"
  | "archived"
  | "general"
  | "service";

type EditorState = {
  id?: string;
  reference: string;
  status: FaqStatus;
  featured: boolean;
  sortOrder: number;
  scope: FaqScope;
  question: FaqI18n;
  answer: FaqI18n;
  serviceIds: string[];
};

const emptyI18n = (): FaqI18n => ({ fr: "", en: "", ar: "" });

function emptyEditor(): EditorState {
  return {
    reference: "",
    status: "draft",
    featured: false,
    sortOrder: 0,
    scope: "general",
    question: emptyI18n(),
    answer: emptyI18n(),
    serviceIds: [],
  };
}

function rowToEditor(row: FaqRow): EditorState {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    featured: row.featured,
    sortOrder: row.sort_order,
    scope: row.scope,
    question: { ...row.question },
    answer: { ...row.answer },
    serviceIds: [...row.service_ids],
  };
}

function editorToPayload(editor: EditorState) {
  return {
    reference: editor.reference.trim(),
    status: editor.status,
    featured: editor.featured,
    sortOrder: editor.sortOrder,
    scope: editor.scope,
    question: editor.question,
    answer: editor.answer,
    serviceIds: editor.serviceIds,
  };
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

function formatUpdatedAt(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

type AdminFaqsPanelProps = {
  initialFaqs?: FaqRow[];
  initialConfigured?: boolean;
};

export function AdminFaqsPanel({
  initialFaqs = [],
  initialConfigured = true,
}: AdminFaqsPanelProps) {
  const t = useTranslations("admin.faqs");
  const tErrors = useTranslations("admin.errors");
  const { loading, setLoading, trySubmit } = useSubmitGuard();

  const [faqs, setFaqs] = useState<FaqRow[]>(initialFaqs);
  const [configured, setConfigured] = useState(initialConfigured);
  const [listError, setListError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ListFilter>("all");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [localeTab, setLocaleTab] = useState<LocaleTab>("fr");
  const [formError, setFormError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);

  const refresh = useCallback(async () => {
    setListError(null);
    try {
      const res = await fetch("/api/admin/faqs", { credentials: "include" });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        faqs?: FaqRow[];
        configured?: boolean;
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        setListError(
          readAdminApiError(
            res,
            body,
            t("loadError"),
            (key) => translateErr(key, tErrors)
          )
        );
        return;
      }
      setFaqs(body.faqs ?? []);
      setConfigured(body.configured !== false);
    } catch {
      setListError(t("loadError"));
    }
  }, [t, tErrors]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/services", {
          credentials: "include",
        });
        if (!res.ok) return;
        const body = (await res.json().catch(() => ({}))) as {
          services?: Array<{
            id: string;
            reference: string;
            title?: { fr?: string; en?: string };
          }>;
        };
        if (cancelled) return;
        setServices(
          (body.services ?? []).map((s) => ({
            id: s.id,
            reference: s.reference,
            title: s.title?.fr || s.title?.en || s.reference,
          }))
        );
      } catch {
        /* ignore — multi-select reste vide */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const serviceLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of services) {
      map.set(s.id, `${s.reference} · ${s.title}`);
    }
    return map;
  }, [services]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((row) => {
      if (filter === "published") return row.status === "published";
      if (filter === "draft") return row.status === "draft";
      if (filter === "archived") return row.status === "archived";
      if (filter === "general") return row.scope === "general";
      if (filter === "service") return row.scope === "service";
      return true;
    });
  }, [faqs, filter]);

  async function save(statusOverride?: FaqStatus) {
    if (!editor) return;
    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") {
        setFormError(getSubmitCooldownMessage());
      }
      return;
    }

    setLoading(true);
    setFormError(null);

    const payload = editorToPayload({
      ...editor,
      status: statusOverride ?? editor.status,
    });
    const parsed = parseFaqWriteBody(payload);
    if (!parsed.ok) {
      setFormError(translateErr(parsed.error, tErrors));
      setLoading(false);
      return;
    }

    try {
      const isEdit = Boolean(editor.id);
      const res = await fetch(
        isEdit ? `/api/admin/faqs/${editor.id}` : "/api/admin/faqs",
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.values),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(
          readAdminApiError(
            res,
            body as { error?: string; code?: string },
            tErrors("generic"),
            (key) => translateErr(key, tErrors)
          )
        );
        return;
      }
      setEditor(null);
      await refresh();
    } catch {
      setFormError(tErrors("generic"));
    } finally {
      setLoading(false);
    }
  }

  async function patchStatus(id: string, status: FaqStatus) {
    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") {
        setListError(getSubmitCooldownMessage());
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setListError(
          readAdminApiError(
            res,
            body as { error?: string; code?: string },
            tErrors("generic"),
            (key) => translateErr(key, tErrors)
          )
        );
        return;
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function archive(id: string) {
    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") {
        setListError(getSubmitCooldownMessage());
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setListError(
          readAdminApiError(
            res,
            body as { error?: string; code?: string },
            tErrors("generic"),
            (key) => translateErr(key, tErrors)
          )
        );
        return;
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function duplicate(id: string) {
    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") {
        setListError(getSubmitCooldownMessage());
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setListError(
          readAdminApiError(
            res,
            body as { error?: string; code?: string },
            t("duplicateError"),
            (key) => translateErr(key, tErrors)
          )
        );
        return;
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") {
        setListError(getSubmitCooldownMessage());
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setListError(
          readAdminApiError(
            res,
            body as { error?: string; code?: string },
            t("deleteError"),
            (key) => translateErr(key, tErrors)
          )
        );
        return;
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function moveOrder(index: number, delta: number) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= filteredFaqs.length) return;
    const guard = trySubmit();
    if (!guard.allowed) return;

    const working = [...faqs];
    const fromId = filteredFaqs[index]?.id;
    const toId = filteredFaqs[nextIndex]?.id;
    if (!fromId || !toId) return;

    const fromPos = working.findIndex((f) => f.id === fromId);
    const toPos = working.findIndex((f) => f.id === toId);
    if (fromPos < 0 || toPos < 0) return;

    const [item] = working.splice(fromPos, 1);
    working.splice(toPos, 0, item);
    setFaqs(working);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: working.map((e) => e.id),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setListError(
          readAdminApiError(
            res,
            body as { error?: string; code?: string },
            tErrors("generic"),
            (key) => translateErr(key, tErrors)
          )
        );
        await refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleService(serviceId: string) {
    setEditor((prev) => {
      if (!prev) return prev;
      const has = prev.serviceIds.includes(serviceId);
      return {
        ...prev,
        serviceIds: has
          ? prev.serviceIds.filter((id) => id !== serviceId)
          : [...prev.serviceIds, serviceId],
      };
    });
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">
          {t("notConfiguredTitle")}
        </h2>
        <p className="mt-2 text-sm text-foreground/60">{t("notConfiguredBody")}</p>
      </div>
    );
  }

  const filters: ListFilter[] = [
    "all",
    "published",
    "draft",
    "archived",
    "general",
    "service",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/60">{t("listTitle")}</p>
        <Button
          type="button"
          onClick={() => {
            setFormError(null);
            setLocaleTab("fr");
            setEditor(emptyEditor());
          }}
          disabled={loading}
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("create")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={t("filtersLabel")}>
        {filters.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`min-h-9 rounded-full border px-3 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              filter === key
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-foreground/60 hover:border-primary/30"
            }`}
          >
            {t(`filters.${key}`)}
          </button>
        ))}
      </div>

      {listError ? <FormError message={listError} /> : null}

      {filteredFaqs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-foreground/55">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid gap-3">
          {filteredFaqs.map((row, index) => {
            const question = row.question.fr || row.question.en || row.reference;
            const serviceLabels = row.service_ids
              .map((id) => serviceLabelById.get(id) ?? id.slice(0, 8))
              .slice(0, 3);
            return (
              <li
                key={row.id}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/75">
                        {row.reference}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/70">
                        {t(`status.${row.status}`)}
                      </span>
                      <span className="rounded-full border border-border-gold/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary/80">
                        {t(`scope.${row.scope}`)}
                      </span>
                      {row.featured ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                          {t("featuredBadge")}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {question}
                    </h3>
                    <p className="text-xs text-foreground/55">
                      {t("sortLabel", { order: row.sort_order })}
                      {" · "}
                      {t("updatedLabel", {
                        date: formatUpdatedAt(row.updated_at, "fr"),
                      })}
                    </p>
                    {serviceLabels.length > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {t("servicesLabel")}: {serviceLabels.join(" · ")}
                        {row.service_ids.length > 3
                          ? ` (+${row.service_ids.length - 3})`
                          : ""}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {t("noServices")}
                      </p>
                    )}
                    <div className="flex items-center gap-1">
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
                        disabled={
                          loading || index === filteredFaqs.length - 1
                        }
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormError(null);
                        setLocaleTab("fr");
                        setEditor(rowToEditor(row));
                      }}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => duplicate(row.id)}
                      disabled={loading}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      {t("duplicate")}
                    </Button>
                    {row.status === "published" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => patchStatus(row.id, "draft")}
                        disabled={loading}
                      >
                        {t("unpublish")}
                      </Button>
                    ) : row.status !== "archived" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => patchStatus(row.id, "published")}
                        disabled={loading}
                      >
                        {t("publish")}
                      </Button>
                    ) : null}
                    {row.status !== "archived" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => archive(row.id)}
                        disabled={loading}
                      >
                        <Archive className="h-3.5 w-3.5" aria-hidden />
                        {t("archive")}
                      </Button>
                    ) : null}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
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
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editor?.id ? t("editTitle") : t("createTitle")}
            </DialogTitle>
            <DialogDescription>{t("formHint")}</DialogDescription>
          </DialogHeader>

          {editor ? (
            <div className="space-y-5">
              {formError ? <FormError message={formError} /> : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={t("fields.reference")} id="faq-ref">
                  <Input
                    id="faq-ref"
                    value={editor.reference}
                    onChange={(e) =>
                      setEditor((p) =>
                        p ? { ...p, reference: e.target.value } : p
                      )
                    }
                    placeholder="VZ—Q09"
                  />
                </FormField>
                <FormField label={t("fields.scope")} id="faq-scope">
                  <Select
                    value={editor.scope}
                    onValueChange={(v) =>
                      setEditor((p) =>
                        p ? { ...p, scope: v as FaqScope } : p
                      )
                    }
                  >
                    <SelectTrigger id="faq-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FAQ_SCOPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`scope.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t("fields.status")} id="faq-status">
                  <Select
                    value={editor.status}
                    onValueChange={(v) =>
                      setEditor((p) =>
                        p ? { ...p, status: v as FaqStatus } : p
                      )
                    }
                  >
                    <SelectTrigger id="faq-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FAQ_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t("fields.sortOrder")} id="faq-order">
                  <Input
                    id="faq-order"
                    type="number"
                    value={editor.sortOrder}
                    onChange={(e) =>
                      setEditor((p) =>
                        p
                          ? {
                              ...p,
                              sortOrder:
                                Number.parseInt(e.target.value, 10) || 0,
                            }
                          : p
                      )
                    }
                  />
                </FormField>
              </div>

              <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-primary"
                  checked={editor.featured}
                  onChange={(e) =>
                    setEditor((p) =>
                      p ? { ...p, featured: e.target.checked } : p
                    )
                  }
                />
                {t("fields.featured")}
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-foreground">
                  {t("fields.services")}
                </legend>
                <p className="text-xs text-muted-foreground">
                  {t("servicesHint")}
                </p>
                {services.length === 0 ? (
                  <p className="text-xs text-foreground/50">{t("noServiceOptions")}</p>
                ) : (
                  <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                    {services.map((s) => {
                      const checked = editor.serviceIds.includes(s.id);
                      return (
                        <li key={s.id}>
                          <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                              checked={checked}
                              onChange={() => toggleService(s.id)}
                            />
                            <span>
                              <span className="font-mono text-[10px] tracking-wider text-primary/75">
                                {s.reference}
                              </span>
                              <span className="mt-0.5 block text-foreground/80">
                                {s.title}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </fieldset>

              <div className="flex gap-2">
                {(["fr", "en", "ar"] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocaleTab(loc)}
                    className={`min-h-9 rounded-md border px-3 font-mono text-[10px] uppercase tracking-wider ${
                      localeTab === loc
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border text-foreground/60"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <FormField label={t("fields.question")} id="faq-question">
                <Input
                  id="faq-question"
                  dir={localeTab === "ar" ? "rtl" : "ltr"}
                  value={editor.question[localeTab]}
                  onChange={(e) =>
                    setEditor((p) =>
                      p
                        ? {
                            ...p,
                            question: {
                              ...p.question,
                              [localeTab]: e.target.value,
                            },
                          }
                        : p
                    )
                  }
                />
              </FormField>
              <FormField label={t("fields.answer")} id="faq-answer">
                <textarea
                  id="faq-answer"
                  dir={localeTab === "ar" ? "rtl" : "ltr"}
                  className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  value={editor.answer[localeTab]}
                  onChange={(e) =>
                    setEditor((p) =>
                      p
                        ? {
                            ...p,
                            answer: {
                              ...p.answer,
                              [localeTab]: e.target.value,
                            },
                          }
                        : p
                    )
                  }
                />
              </FormField>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditor(null)}
              disabled={loading}
            >
              <X className="h-4 w-4" aria-hidden />
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => save("draft")}
              loading={loading}
            >
              {!loading && <Save className="h-4 w-4" aria-hidden />}
              {t("saveDraft")}
            </Button>
            <Button
              type="button"
              onClick={() => save("published")}
              disabled={loading}
            >
              {t("savePublish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

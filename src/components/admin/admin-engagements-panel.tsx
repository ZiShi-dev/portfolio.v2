"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  ChevronDown,
  ChevronUp,
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
import { ENGAGEMENT_ICON_KEYS } from "@/lib/engagements/icons";
import {
  ENGAGEMENT_STATUSES,
  parseEngagementWriteBody,
  type EngagementStatus,
} from "@/lib/engagements/schema";
import type { EngagementI18n, EngagementRow } from "@/lib/engagements/store";
import {
  getSubmitCooldownMessage,
  useSubmitGuard,
} from "@/hooks/use-submit-guard";

type LocaleTab = keyof EngagementI18n;

type EditorState = {
  id?: string;
  reference: string;
  icon: string;
  status: EngagementStatus;
  sortOrder: number;
  title: EngagementI18n;
  description: EngagementI18n;
};

const emptyI18n = (): EngagementI18n => ({ fr: "", en: "", ar: "" });

function emptyEditor(): EditorState {
  return {
    reference: "",
    icon: "file-check",
    status: "draft",
    sortOrder: 0,
    title: emptyI18n(),
    description: emptyI18n(),
  };
}

function rowToEditor(row: EngagementRow): EditorState {
  return {
    id: row.id,
    reference: row.reference,
    icon: row.icon,
    status: row.status,
    sortOrder: row.sort_order,
    title: { ...row.title },
    description: { ...row.description },
  };
}

function editorToPayload(editor: EditorState) {
  return {
    reference: editor.reference.trim(),
    icon: editor.icon,
    status: editor.status,
    sortOrder: editor.sortOrder,
    title: editor.title,
    description: editor.description,
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

type AdminEngagementsPanelProps = {
  initialEngagements?: EngagementRow[];
  initialConfigured?: boolean;
};

export function AdminEngagementsPanel({
  initialEngagements = [],
  initialConfigured = true,
}: AdminEngagementsPanelProps) {
  const t = useTranslations("admin.engagements");
  const tErrors = useTranslations("admin.errors");
  const { loading, setLoading, trySubmit } = useSubmitGuard();

  const [engagements, setEngagements] =
    useState<EngagementRow[]>(initialEngagements);
  const [configured, setConfigured] = useState(initialConfigured);
  const [listError, setListError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [localeTab, setLocaleTab] = useState<LocaleTab>("fr");
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setListError(null);
    try {
      const res = await fetch("/api/admin/engagements", {
        credentials: "include",
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        engagements?: EngagementRow[];
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
      setEngagements(body.engagements ?? []);
      setConfigured(body.configured !== false);
    } catch {
      setListError(t("loadError"));
    }
  }, [t, tErrors]);

  async function save(statusOverride?: EngagementStatus) {
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
    const parsed = parseEngagementWriteBody(payload);
    if (!parsed.ok) {
      setFormError(translateErr(parsed.error, tErrors));
      setLoading(false);
      return;
    }

    try {
      const isEdit = Boolean(editor.id);
      const res = await fetch(
        isEdit
          ? `/api/admin/engagements/${editor.id}`
          : "/api/admin/engagements",
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

  async function patchStatus(id: string, status: EngagementStatus) {
    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") {
        setListError(getSubmitCooldownMessage());
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/engagements/${id}`, {
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
      const res = await fetch(`/api/admin/engagements/${id}`, {
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
      const res = await fetch(`/api/admin/engagements/${id}`, {
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
    if (nextIndex < 0 || nextIndex >= engagements.length) return;
    const guard = trySubmit();
    if (!guard.allowed) return;

    const next = [...engagements];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setEngagements(next);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/engagements", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: next.map((e) => e.id),
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

      {listError ? <FormError message={listError} /> : null}

      {engagements.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-foreground/55">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid gap-3">
          {engagements.map((row, index) => {
            const name = row.title.fr || row.title.en || row.reference;
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
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {name}
                    </h3>
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
                        disabled={loading || index === engagements.length - 1}
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
                <FormField label={t("fields.reference")} id="eng-ref">
                  <Input
                    id="eng-ref"
                    value={editor.reference}
                    onChange={(e) =>
                      setEditor((p) =>
                        p ? { ...p, reference: e.target.value } : p
                      )
                    }
                    placeholder="VZ—C05"
                  />
                </FormField>
                <FormField label={t("fields.icon")} id="eng-icon">
                  <Select
                    value={editor.icon}
                    onValueChange={(v) =>
                      setEditor((p) => (p ? { ...p, icon: v } : p))
                    }
                  >
                    <SelectTrigger id="eng-icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGAGEMENT_ICON_KEYS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t("fields.status")} id="eng-status">
                  <Select
                    value={editor.status}
                    onValueChange={(v) =>
                      setEditor((p) =>
                        p ? { ...p, status: v as EngagementStatus } : p
                      )
                    }
                  >
                    <SelectTrigger id="eng-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGAGEMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t("fields.sortOrder")} id="eng-order">
                  <Input
                    id="eng-order"
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

              <FormField label={t("fields.title")} id="eng-title">
                <Input
                  id="eng-title"
                  dir={localeTab === "ar" ? "rtl" : "ltr"}
                  value={editor.title[localeTab]}
                  onChange={(e) =>
                    setEditor((p) =>
                      p
                        ? {
                            ...p,
                            title: {
                              ...p.title,
                              [localeTab]: e.target.value,
                            },
                          }
                        : p
                    )
                  }
                />
              </FormField>
              <FormField label={t("fields.description")} id="eng-desc">
                <textarea
                  id="eng-desc"
                  dir={localeTab === "ar" ? "rtl" : "ltr"}
                  className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  value={editor.description[localeTab]}
                  onChange={(e) =>
                    setEditor((p) =>
                      p
                        ? {
                            ...p,
                            description: {
                              ...p.description,
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


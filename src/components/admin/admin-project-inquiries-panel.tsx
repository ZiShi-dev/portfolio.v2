"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  Copy,
  ExternalLink,
  Orbit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
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
import {
  PROJECT_INQUIRY_STATUSES,
  type ProjectInquiryStatus,
} from "@/data/project-inquiry-options";
import { PROJECT_INQUIRY_LIMITS } from "@/lib/project-inquiry/schema";
import type { ProjectInquiryRow } from "@/lib/project-inquiry/store";
import { cn } from "@/lib/utils";

type Filter = "all" | ProjectInquiryStatus;

type ListResponse = {
  ok?: boolean;
  configured?: boolean;
  inquiries?: ProjectInquiryRow[];
  error?: string;
  code?: string;
};

type PatchResponse = {
  ok?: boolean;
  inquiry?: ProjectInquiryRow;
  error?: string;
  code?: string;
};

const INITIAL_FILTER: Filter = "new";
const STATUS_FILTERS: Filter[] = ["all", ...PROJECT_INQUIRY_STATUSES];

type AdminProjectInquiriesPanelProps = {
  initialInquiries?: ProjectInquiryRow[];
  initialConfigured?: boolean;
};

export function AdminProjectInquiriesPanel({
  initialInquiries,
  initialConfigured = true,
}: AdminProjectInquiriesPanelProps = {}) {
  const t = useTranslations("admin.inquiries");
  const tInquiry = useTranslations("projectInquiry");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("admin.errors");

  const [filter, setFilter] = useState<Filter>(INITIAL_FILTER);
  const [inquiries, setInquiries] = useState<ProjectInquiryRow[]>(
    initialInquiries ?? []
  );
  const [configured, setConfigured] = useState(initialConfigured);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] =
    useState<ProjectInquiryRow | null>(null);
  const [editStatus, setEditStatus] = useState<ProjectInquiryStatus>("new");
  const [editNotes, setEditNotes] = useState("");
  const [loading, setLoading] = useState(initialInquiries === undefined);
  const [pending, startTransition] = useTransition();
  const opRef = useRef(0);

  const open = selectedId !== null;
  const selected =
    inquiries.find((row) => row.id === selectedId) ?? selectedSnapshot;

  const typeLabel = (id: string, other?: string | null) => {
    if (id === "other" && other?.trim()) return other.trim();
    const key = `types.${id}.title` as Parameters<typeof tInquiry>[0];
    return tInquiry.has(key) ? tInquiry(key) : id;
  };
  const objectiveLabel = (id: string, other?: string | null) => {
    if (id === "other" && other?.trim()) return other.trim();
    const key = `objectives.${id}` as Parameters<typeof tInquiry>[0];
    return tInquiry.has(key) ? tInquiry(key) : id;
  };
  const budgetLabel = (id: string, customAmount?: number | null) => {
    if (id === "custom" && customAmount != null) {
      return tInquiry("budgets.customAmount", {
        amount: customAmount.toLocaleString("fr-FR"),
      });
    }
    const key = `budgets.${id}` as Parameters<typeof tInquiry>[0];
    return tInquiry.has(key) ? tInquiry(key) : id;
  };
  const timelineLabel = (id: string) => {
    const key = `timelines.${id}` as Parameters<typeof tInquiry>[0];
    return tInquiry.has(key) ? tInquiry(key) : id;
  };
  const statusLabel = (status: ProjectInquiryStatus | Filter) =>
    t(`filters.${status}` as "filters.all");

  const load = useCallback(
    async (status: Filter, opToken?: number, silent = false) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/admin/project-inquiries?status=${encodeURIComponent(status)}`,
          { credentials: "same-origin", cache: "no-store" }
        );
        if (opToken !== undefined && opToken !== opRef.current) return;
        const body = (await res.json().catch(() => null)) as ListResponse | null;
        if (!res.ok) {
          setError(
            readAdminApiError(res, body, tErrors("generic"), (key) =>
              tErrors(key)
            )
          );
          return;
        }
        setConfigured(body?.configured !== false);
        setInquiries(body?.inquiries ?? []);
      } catch {
        if (opToken === undefined || opToken === opRef.current) {
          setError(tErrors("generic"));
        }
      } finally {
        if (opToken === undefined || opToken === opRef.current) {
          setLoading(false);
        }
      }
    },
    [tErrors]
  );

  useEffect(() => {
    if (initialInquiries !== undefined) return;
    void load(INITIAL_FILTER);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  function closeModal() {
    setSelectedId(null);
    setSelectedSnapshot(null);
    setSaveMessage("");
  }

  function changeFilter(next: Filter) {
    setFilter(next);
    closeModal();
    void load(next);
  }

  function openInquiry(row: ProjectInquiryRow) {
    setSelectedId(row.id);
    setSelectedSnapshot(row);
    setEditStatus(row.status);
    setEditNotes(row.admin_notes ?? "");
    setSaveMessage("");
  }

  async function saveSelected() {
    if (!selected) return;
    setError("");
    setSaveMessage("");
    const opToken = ++opRef.current;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/project-inquiries/${selected.id}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: editStatus,
            adminNotes: editNotes.trim() || null,
          }),
        });
        if (opToken !== opRef.current) return;
        const body = (await res.json().catch(() => null)) as PatchResponse | null;
        if (!res.ok) {
          setError(
            readAdminApiError(res, body, tErrors("generic"), (key) =>
              tErrors(key)
            )
          );
          return;
        }
        const updated = body?.inquiry;
        if (updated) {
          setSelectedSnapshot(updated);
          setInquiries((prev) => {
            const next = prev.map((row) =>
              row.id === updated.id ? updated : row
            );
            if (filter !== "all" && filter !== updated.status) {
              return next.filter((row) => row.id !== updated.id);
            }
            return next;
          });
        } else {
          await load(filter, opToken, true);
        }
        setSaveMessage(t("actions.saved"));
      } catch {
        if (opToken === opRef.current) setError(tErrors("generic"));
      }
    });
  }

  async function remove(id: string) {
    setError("");
    setSaveMessage("");
    const opToken = ++opRef.current;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/project-inquiries/${id}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
        if (opToken !== opRef.current) return;
        const body = (await res.json().catch(() => null)) as ListResponse | null;
        if (!res.ok) {
          setError(
            readAdminApiError(res, body, tErrors("generic"), (key) =>
              tErrors(key)
            )
          );
          return;
        }
        setInquiries((prev) => prev.filter((row) => row.id !== id));
        if (selectedId === id) closeModal();
        setSaveMessage(t("actions.deleted"));
      } catch {
        if (opToken === opRef.current) setError(tErrors("generic"));
      }
    });
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError(tErrors("generic"));
    }
  }

  if (!configured) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Orbit className="h-5 w-5 text-primary" aria-hidden />
          {t("notConfiguredTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
          {t("notConfiguredBody")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Orbit className="h-5 w-5 text-primary" aria-hidden />
          {t("title")}
        </h2>
        <Select
          value={filter}
          onValueChange={(value) => changeFilter(value as Filter)}
        >
          <SelectTrigger
            className="h-9 w-full max-w-[16rem] sm:w-56"
            aria-label={t("title")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((id) => (
              <SelectItem key={id} value={id}>
                {statusLabel(id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-2 text-sm text-foreground/55">{t("subtitle")}</p>

      {error ? (
        <div className="mt-4 space-y-3">
          <FormError message={error} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load(filter)}
          >
            {t("retry")}
          </Button>
        </div>
      ) : null}

      {saveMessage && !error ? (
        <p className="mt-4 text-sm font-medium text-primary" role="status">
          {saveMessage}
        </p>
      ) : null}

      <ul
        className="mt-6 max-h-[32rem] space-y-2 overflow-y-auto pe-1"
        aria-busy={loading}
        aria-label={loading ? tCommon("loading") : undefined}
      >
        {loading ? (
          Array.from({ length: 5 }, (_, i) => (
            <li
              key={`sk-${i}`}
              className="rounded-xl border border-border bg-background/50 px-4 py-3"
              aria-hidden
            >
              <div className="flex items-start justify-between gap-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 shrink-0 animate-pulse rounded bg-muted/80" />
              </div>
              <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted/70" />
              <div className="mt-2 h-3 w-full max-w-[16rem] animate-pulse rounded bg-muted/60" />
            </li>
          ))
        ) : inquiries.length === 0 ? (
          <li className="py-8 text-sm text-foreground/50">{t("empty")}</li>
        ) : (
          inquiries.map((row) => (
            <li key={row.id}>
              <div
                className={cn(
                  "flex items-stretch gap-2 rounded-xl border border-border bg-background/50 transition-colors hover:border-primary/25",
                  row.status === "new" && "border-s-2 border-s-primary"
                )}
              >
                <button
                  type="button"
                  onClick={() => openInquiry(row)}
                  className="min-w-0 flex-1 px-4 py-3 text-start"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-mono text-xs tracking-wide text-primary">
                      {row.reference || "—"}
                    </p>
                    <time className="shrink-0 text-[11px] text-foreground/40">
                      {new Date(row.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{row.name}</p>
                  <p className="mt-0.5 truncate text-xs text-foreground/50">
                    {[
                      row.company,
                      typeLabel(row.project_type, row.project_type_other),
                      budgetLabel(row.budget_range, row.budget_custom_amount),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-foreground/45">
                    {statusLabel(row.status)}
                  </p>
                </button>

                <div className="flex shrink-0 items-center border-s border-border pe-2 ps-1">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={pending}
                        className="text-muted-foreground hover:bg-red-950/40 hover:text-red-300"
                        aria-label={t("actions.delete")}
                        title={t("actions.delete")}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("actions.confirmDeleteTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("actions.confirmDelete")}
                          {row.reference ? (
                            <span className="mt-2 block font-mono text-xs text-foreground/60">
                              {row.reference} · {row.name}
                            </span>
                          ) : null}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={pending}>
                          {t("actions.confirmDeleteCancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={pending}
                          className="bg-red-800 text-red-50 hover:bg-red-900"
                          onClick={() => void remove(row.id)}
                        >
                          {t("actions.confirmDeleteAction")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <Dialog
        open={open && Boolean(selected)}
        onOpenChange={(next) => {
          if (!next) closeModal();
        }}
      >
        {selected ? (
          <DialogContent
            className="max-w-xl gap-0 p-0 sm:p-0"
            closeLabel={tCommon("closeModal")}
          >
            <div className="flex max-h-[min(92dvh,44rem)] flex-col">
              <DialogHeader className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
                <DialogTitle className="font-mono text-base tracking-wide">
                  {selected.reference || selected.name}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-1 text-start">
                    <p className="text-sm text-foreground/70">{selected.name}</p>
                    <p className="text-xs text-foreground/45">
                      {new Date(selected.created_at).toLocaleString()} ·{" "}
                      {statusLabel(selected.status)}
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="scrollbar-overlay min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <Detail
                    label={t("fields.type")}
                    value={typeLabel(
                      selected.project_type,
                      selected.project_type_other
                    )}
                  />
                  <Detail
                    label={t("fields.objective")}
                    value={objectiveLabel(
                      selected.objective,
                      selected.objective_other
                    )}
                  />
                  <Detail
                    label={t("fields.budget")}
                    value={budgetLabel(
                      selected.budget_range,
                      selected.budget_custom_amount
                    )}
                  />
                  <Detail
                    label={t("fields.timeline")}
                    value={timelineLabel(selected.timeline)}
                  />
                  {selected.target_launch_date ? (
                    <Detail
                      label={t("fields.launch")}
                      value={selected.target_launch_date}
                    />
                  ) : null}
                  {selected.company ? (
                    <Detail
                      label={t("fields.company")}
                      value={selected.company}
                    />
                  ) : null}
                  <Detail label={t("fields.locale")} value={selected.locale} />
                  {selected.source ? (
                    <Detail label={t("fields.source")} value={selected.source} />
                  ) : null}
                </dl>

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-widest text-foreground/45">
                    {t("fields.description")}
                  </p>
                  <div className="whitespace-pre-wrap break-words rounded-xl border border-border/60 bg-muted/20 p-3 text-sm leading-relaxed text-foreground/85">
                    {selected.description}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-foreground/45">
                    {t("fields.contact")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void copyText(selected.email)}
                    >
                      <Copy className="h-4 w-4" aria-hidden />
                      {t("actions.copyEmail")}
                    </Button>
                    {selected.phone ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void copyText(selected.phone!)}
                      >
                        <Copy className="h-4 w-4" aria-hidden />
                        {t("actions.copyPhone")}
                      </Button>
                    ) : null}
                    {selected.current_website ? (
                      <Button type="button" size="sm" variant="outline" asChild>
                        <a
                          href={selected.current_website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                          {t("actions.openSite")}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-foreground/55">
                    {selected.email}
                    {selected.phone ? ` · ${selected.phone}` : ""}
                    {selected.whatsapp ? ` · WA ${selected.whatsapp}` : ""}
                  </p>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div>
                    <label
                      htmlFor="inquiry-status"
                      className="mb-1 block text-xs font-medium text-foreground/60"
                    >
                      {t("fields.status")}
                    </label>
                    <Select
                      value={editStatus}
                      onValueChange={(value) =>
                        setEditStatus(value as ProjectInquiryStatus)
                      }
                    >
                      <SelectTrigger id="inquiry-status" className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_INQUIRY_STATUSES.map((id) => (
                          <SelectItem key={id} value={id}>
                            {statusLabel(id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      htmlFor="inquiry-notes"
                      className="mb-1 block text-xs font-medium text-foreground/60"
                    >
                      {t("fields.notes")}
                    </label>
                    <Textarea
                      id="inquiry-notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      maxLength={PROJECT_INQUIRY_LIMITS.adminNotesMax}
                      rows={4}
                      className="min-h-[7rem]"
                    />
                  </div>
                  {saveMessage ? (
                    <p className="text-xs text-primary">{saveMessage}</p>
                  ) : null}
                </div>
              </div>

              <DialogFooter className="shrink-0 flex-row flex-wrap justify-start gap-2 border-t border-border px-5 py-4 sm:justify-start sm:px-6">
                <Button
                  type="button"
                  size="sm"
                  loading={pending}
                  onClick={() => void saveSelected()}
                >
                  {!pending && <Check className="h-4 w-4" aria-hidden />}
                  {pending ? t("actions.saving") : t("actions.save")}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={pending}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      {t("actions.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("actions.confirmDeleteTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("actions.confirmDelete")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={pending}>
                        {t("actions.confirmDeleteCancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={pending}
                        className="bg-red-800 text-red-50 hover:bg-red-900"
                        onClick={() => void remove(selected.id)}
                      >
                        {t("actions.confirmDeleteAction")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest text-foreground/45">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground/80">{value}</dd>
    </div>
  );
}

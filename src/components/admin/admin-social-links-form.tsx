"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, ListOrdered, Mail, Save, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { readAdminApiError } from "@/lib/admin/api-error";
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SOCIAL_IDS,
  SITE_SOCIAL_LABELS,
  normalizeContactPriority,
  type SiteSettings,
  type SiteSocialId,
} from "@/data/site-social";
import {
  siteSocialUpdateSchema,
  type SiteSocialUpdateInput,
} from "@/lib/social/schema";
import { useSubmitGuard } from "@/hooks/use-submit-guard";

type LoadResponse = {
  ok?: boolean;
  configured?: boolean;
  settings?: SiteSettings;
  links?: SiteSettings;
  updatedAt?: string | null;
  error?: string;
  code?: string;
};

type AdminSocialLinksFormProps = {
  initialSettings?: SiteSettings;
  initialConfigured?: boolean;
};

export function AdminSocialLinksForm({
  initialSettings,
  initialConfigured = true,
}: AdminSocialLinksFormProps = {}) {
  const t = useTranslations("admin.socialLinks");
  const tErrors = useTranslations("admin.errors");
  const [configured, setConfigured] = useState(initialConfigured);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(initialSettings === undefined);
  /** Réglages tels qu’enregistrés : sert de base à la priorité et aux réseaux vides. */
  const [saved, setSaved] = useState<SiteSettings>(
    initialSettings ?? DEFAULT_SITE_SETTINGS
  );
  const [priority, setPriority] = useState<SiteSocialId[]>(() =>
    normalizeContactPriority(initialSettings?.contactPriority)
  );
  const [priorityDirty, setPriorityDirty] = useState(false);
  const { loading: saving, setLoading: setSaving, trySubmit } = useSubmitGuard();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SiteSocialUpdateInput>({
    resolver: zodResolver(siteSocialUpdateSchema),
    defaultValues: initialSettings ?? DEFAULT_SITE_SETTINGS,
    mode: "onBlur",
  });

  const applySettings = useCallback(
    (settings: SiteSettings) => {
      setSaved(settings);
      setPriority(normalizeContactPriority(settings.contactPriority));
      setPriorityDirty(false);
      reset(settings);
    },
    [reset]
  );

  const movePriority = (id: SiteSocialId, direction: -1 | 1) => {
    setPriority((current) => {
      const from = current.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setPriorityDirty(true);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/social-links", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const body = (await res.json().catch(() => null)) as LoadResponse | null;
      if (!res.ok) {
        setLoadError(
          readAdminApiError(res, body, tErrors("generic"), (key) =>
            tErrors(key)
          )
        );
        return;
      }
      setConfigured(body?.configured !== false);
      const settings = body?.settings ?? body?.links;
      if (settings) {
        applySettings(settings);
      }
    } catch {
      setLoadError(tErrors("generic"));
    } finally {
      setLoading(false);
    }
  }, [applySettings, tErrors]);

  useEffect(() => {
    if (initialSettings !== undefined) return;
    const frame = window.requestAnimationFrame(() => {
      void load();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialSettings, load]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    setSuccessMessage("");

    const guard = trySubmit();
    if (!guard.allowed) {
      if (guard.reason === "cooldown") {
        setSubmitError(tErrors("cooldown"));
      }
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/social-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...values, contactPriority: priority }),
      });
      const body = (await res.json().catch(() => null)) as LoadResponse | null;
      if (!res.ok) {
        setSubmitError(
          readAdminApiError(res, body, tErrors("generic"), (key) =>
            tErrors(key)
          )
        );
        return;
      }
      const settings = body?.settings ?? body?.links;
      if (settings) {
        applySettings(settings);
      }
      setSuccessMessage(t("saved"));
    } catch {
      setSubmitError(tErrors("generic"));
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <div
        className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8"
        aria-busy="true"
        aria-label={t("loading")}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded-md bg-muted" />
            <div className="h-5 w-44 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted/70" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`social-skel-${i}`} className="space-y-2">
              <div className="h-3.5 w-28 animate-pulse rounded bg-muted/80" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted/60" />
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
        <Button type="button" variant="outline" className="mt-4" onClick={() => void load()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Share2 className="h-5 w-5 text-primary" aria-hidden />
          {t("notConfiguredTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
          {t("notConfiguredBody")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8"
      noValidate
    >
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Share2 className="h-5 w-5 text-primary" aria-hidden />
          {t("formTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-foreground/60">{t("formHint")}</p>
      </div>

      <FormField
        id="social-contact-email"
        label={t("fields.contactEmail")}
        hint={t("hints.contactEmail")}
        required
        error={
          errors.contactEmail?.message
            ? t("validation.contactEmail")
            : undefined
        }
        className="sm:col-span-2"
      >
        <div className="relative">
          <Mail
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40"
            aria-hidden
          />
          <Input
            id="social-contact-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("placeholders.contactEmail")}
            className="ps-9"
            aria-invalid={Boolean(errors.contactEmail)}
            {...register("contactEmail")}
          />
        </div>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        {SITE_SOCIAL_IDS.map((id) => (
          <FormField
            key={id}
            id={`social-${id}`}
            label={t(`fields.${id}`)}
            hint={t(`hints.${id}`)}
            error={
              errors[id]?.message
                ? t(`validation.${id}`)
                : undefined
            }
          >
            <Input
              id={`social-${id}`}
              type="url"
              inputMode="url"
              placeholder={t(`placeholders.${id}`)}
              autoComplete="off"
              aria-invalid={Boolean(errors[id])}
              {...register(id)}
            />
          </FormField>
        ))}
      </div>

      <fieldset className="space-y-3 rounded-xl border border-border bg-background/40 p-4 sm:p-5">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
          <ListOrdered className="h-4 w-4 text-primary" aria-hidden />
          {t("priorityTitle")}
        </legend>
        <p className="text-sm text-foreground/60">{t("priorityHint")}</p>
        <ol className="space-y-2">
          {priority.map((id, index) => {
            const filled = saved[id].trim() !== "";
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <span className="w-5 shrink-0 text-center text-sm font-medium tabular-nums text-foreground/45">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-sm font-medium">
                    {SITE_SOCIAL_LABELS[id]}
                  </span>
                  {index === 0 && filled ? (
                    <span className="ms-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                      {t("priorityMain")}
                    </span>
                  ) : null}
                  {filled ? null : (
                    <span className="ms-2 text-[11px] text-foreground/45">
                      {t("priorityMissing")}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t("priorityMoveUp", {
                      network: SITE_SOCIAL_LABELS[id],
                    })}
                    disabled={index === 0}
                    onClick={() => movePriority(id, -1)}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t("priorityMoveDown", {
                      network: SITE_SOCIAL_LABELS[id],
                    })}
                    disabled={index === priority.length - 1}
                    onClick={() => movePriority(id, 1)}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </Button>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-foreground/45">{t("priorityEmailNote")}</p>
      </fieldset>

      {submitError ? <FormError message={submitError} /> : null}
      {successMessage ? (
        <p className="text-sm font-medium text-primary" role="status">
          {successMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        loading={saving}
        disabled={!isDirty && !priorityDirty}
      >
        {saving ? (
          t("saving")
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden />
            {t("save")}
          </>
        )}
      </Button>
    </form>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import { getAdminLocale } from "@/lib/admin/i18n";
import { requireAdminPageUser } from "@/lib/admin/require-admin-page";
import { ServiceIcon } from "@/lib/services/icons";
import { resolveServicePriceDisplay } from "@/lib/services/pricing";
import { getAdminPreviewService } from "@/lib/services/site";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Preview offre — Admin",
    robots: { index: false, follow: false },
  };
}

/**
 * Preview admin (drafts inclus). Protégé — jamais indexable.
 */
export default async function AdminServicePreviewPage({ params }: PageProps) {
  await requireAdminPageUser();
  const locale = (await getAdminLocale()) as Locale;
  setRequestLocale(locale);
  const { id } = await params;

  const preview = await getAdminPreviewService(locale, id);
  if (!preview) notFound();

  const { service, row } = preview;
  const t = await getTranslations("services");
  const price = resolveServicePriceDisplay({
    pricingMode: service.pricingMode,
    startingPriceCents: service.startingPriceCents,
    currency: service.currency,
    locale,
    labels: {
      startingAt: (price) => t("pricing.startingAt", { price }),
      quoteOnly: t("pricing.quoteOnly"),
      contact: t("pricing.contact"),
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
        Preview admin · statut <strong>{row.status}</strong> · non indexable
      </div>

      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/70">
            {service.reference}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
            {service.title || "(sans titre)"}
          </h1>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border text-primary">
          <ServiceIcon name={service.icon} className="h-5 w-5" />
        </div>
      </header>

      <p className="text-muted-foreground">{service.shortDescription}</p>

      {service.idealFor ? (
        <section className="rounded-xl border border-border p-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
            {t("idealFor")}
          </h2>
          <p className="mt-2 text-sm">{service.idealFor}</p>
        </section>
      ) : null}

      {service.includedFeatures.length > 0 ? (
        <ul className="space-y-2">
          {service.includedFeatures.map((f) => (
            <li key={f} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="font-mono text-sm">{price.label}</p>
      {price.mode === "starting_at" ? (
        <p className="text-xs text-muted-foreground">{t("pricing.disclaimer")}</p>
      ) : null}
    </div>
  );
}

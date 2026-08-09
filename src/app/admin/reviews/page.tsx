import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { AdminReviewsPanel } from "@/components/admin/admin-reviews-panel";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { getAdminLocale } from "@/lib/admin/i18n";
import { requireAdminPageUser } from "@/lib/admin/require-admin-page";
import {
  countReviewsByStatus,
  listReviews,
} from "@/lib/reviews/store";
import { listProjectsForAdmin } from "@/lib/projects/store";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.meta" });
  return {
    title: t("reviewsTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminReviewsPage() {
  const locale = await getAdminLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.dashboard");

  await requireAdminPageUser();

  const configured = isSupabaseServiceConfigured();
  const [initialReviews, initialPendingCount, projectsListed] = configured
    ? await Promise.all([
        listReviews({ status: "published", limit: 50 }),
        countReviewsByStatus("pending"),
        listProjectsForAdmin(),
      ])
    : [null, 0, null];

  const projectOptions =
    projectsListed &&
    typeof projectsListed === "object" &&
    "ok" in projectsListed &&
    projectsListed.ok &&
    projectsListed.configured
      ? projectsListed.projects.map((p) => ({
          id: p.id,
          slug: p.slug,
          reference: p.reference,
          title: p.title.fr || p.title.en || p.slug,
        }))
      : [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ADMIN_ROUTES.home}
          className="inline-flex items-center gap-2 text-sm text-foreground/55 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
          {t("backToDashboard")}
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          {t("reviewsPageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground/60">
          {t("reviewsPageSubtitle")}
        </p>
      </div>

      <AdminReviewsPanel
        initialReviews={initialReviews ?? []}
        initialPendingCount={initialPendingCount}
        initialConfigured={configured}
        projectOptions={projectOptions}
      />
    </div>
  );
}

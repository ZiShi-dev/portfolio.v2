import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquareQuote,
  FolderKanban,
  BarChart3,
  Orbit,
  Share2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CircleHelp,
} from "lucide-react";
import { AdminHeaderActions } from "@/components/admin/admin-header-actions";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { getAdminLocale } from "@/lib/admin/i18n";
import { requireAdminPageUser } from "@/lib/admin/require-admin-page";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";
import { countNewProjectInquiries } from "@/lib/project-inquiry/store";
import {
  countReviewsByStatus,
  getPublishedReviews,
} from "@/lib/reviews/store";
import {
  countDemoProjects,
  listProjectsForAdmin,
} from "@/lib/projects/store";
import { listServicesForAdmin } from "@/lib/services/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.meta" });
  return {
    title: t("dashboardTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminDashboardPage() {
  const locale = await getAdminLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.dashboard");

  const user = await requireAdminPageUser();

  const configured = isSupabaseServiceConfigured();
  const newInquiries = configured ? await countNewProjectInquiries() : 0;
  const pendingReviews = configured
    ? await countReviewsByStatus("pending")
    : 0;
  const publishedReviews = await getPublishedReviews();
  const projectsAdmin = configured ? await listProjectsForAdmin() : null;
  const projectsCount =
    projectsAdmin?.ok && projectsAdmin.configured
      ? projectsAdmin.projects.length
      : countDemoProjects();
  const servicesAdmin = configured ? await listServicesForAdmin() : null;
  const allOffers =
    servicesAdmin?.ok && servicesAdmin.configured
      ? servicesAdmin.services
      : [];
  const servicesCount = allOffers.filter((s) => s.offer_kind === "service")
    .length;
  const forSaleCount = allOffers.filter((s) => s.offer_kind === "product")
    .length;

  const stats = [
    {
      label: configured ? t("stats.pendingReviews") : t("stats.reviews"),
      value: configured ? pendingReviews : publishedReviews.length,
      icon: MessageSquareQuote,
      hint: configured
        ? t("stats.pendingReviewsHint")
        : t("stats.reviewsHint"),
    },
    {
      label: t("stats.projects"),
      value: projectsCount,
      icon: FolderKanban,
      hint: t("stats.projectsHint"),
    },
    {
      label: t("stats.services"),
      value: servicesCount,
      icon: Sparkles,
      hint: t("stats.servicesHint"),
    },
    {
      label: t("stats.forSale"),
      value: forSaleCount,
      icon: ShoppingBag,
      hint: t("stats.forSaleHint"),
    },
    {
      label: t("stats.newInquiries"),
      value: configured ? String(newInquiries) : "—",
      icon: Orbit,
      hint: t("stats.newInquiriesHint"),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-foreground/60">
            {t("signedInAs")}{" "}
            <span className="font-medium text-foreground/80">{user.email}</span>
          </p>
        </div>
        <AdminHeaderActions />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <section
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                <stat.icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-foreground/45">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{stat.value}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-foreground/55">{stat.hint}</p>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Orbit className="h-5 w-5 text-primary" aria-hidden />
              {t("inquiriesTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("inquiriesBody")}
            </p>
            {configured && newInquiries > 0 ? (
              <p className="mt-3 text-sm font-medium text-primary">
                {t("inquiriesNewBadge", { count: newInquiries })}
              </p>
            ) : null}
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.inquiries}>
              {t("manageInquiries")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquareQuote className="h-5 w-5 text-primary" aria-hidden />
              {t("reviewsTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("reviewsBody")}
            </p>
            {configured && pendingReviews > 0 ? (
              <p className="mt-3 text-sm font-medium text-primary">
                {t("reviewsPendingBadge", { count: pendingReviews })}
              </p>
            ) : publishedReviews.length > 0 ? (
              <p className="mt-3 text-sm font-medium text-primary">
                {t("reviewsPublishedBadge", { count: publishedReviews.length })}
              </p>
            ) : (
              <p className="mt-3 text-sm text-foreground/55">{t("reviewsNext")}</p>
            )}
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.reviews}>
              {t("manageReviews")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
              {t("aboutStatsTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("aboutStatsBody")}
            </p>
            <p className="mt-3 text-sm text-foreground/55">{t("aboutStatsNext")}</p>
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.about}>
              {t("manageAboutStats")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              {t("servicesTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("servicesBody")}
            </p>
            <p className="mt-3 text-sm text-foreground/55">{t("servicesNext")}</p>
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.services}>
              {t("manageServices")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingBag className="h-5 w-5 text-primary" aria-hidden />
              {t("forSaleTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("forSaleBody")}
            </p>
            <p className="mt-3 text-sm text-foreground/55">{t("forSaleNext")}</p>
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.forSale}>
              {t("manageForSale")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              {t("engagementsTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("engagementsBody")}
            </p>
            <p className="mt-3 text-sm text-foreground/55">{t("engagementsNext")}</p>
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.engagements}>
              {t("manageEngagements")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CircleHelp className="h-5 w-5 text-primary" aria-hidden />
              {t("faqsTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("faqsBody")}
            </p>
            <p className="mt-3 text-sm text-foreground/55">{t("faqsNext")}</p>
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.faqs}>
              {t("manageFaqs")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FolderKanban className="h-5 w-5 text-primary" aria-hidden />
              {t("projectsTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("projectsBody")}
            </p>
            <p className="mt-3 text-sm text-foreground/55">{t("projectsNext")}</p>
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.projects}>
              {t("manageProjects")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Share2 className="h-5 w-5 text-primary" aria-hidden />
              {t("settingsTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
              {t("settingsBody")}
            </p>
            <p className="mt-3 text-sm text-foreground/55">{t("settingsNext")}</p>
          </div>
          <Button asChild className="shrink-0 self-start">
            <Link href={ADMIN_ROUTES.settings}>
              {t("manageSettings")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">{t("demoTitle")}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
          {t("demoBody")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-border bg-background px-4 py-2 transition-colors hover:border-primary/40"
          >
            {t("viewSite")}
          </Link>
        </div>
      </section>
    </div>
  );
}

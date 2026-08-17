import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import {
  AdminDashboardOverview,
  type OverviewTodoItem,
} from "@/components/admin/admin-dashboard-overview";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { getAdminLocale } from "@/lib/admin/i18n";
import { requireAdminPageUser } from "@/lib/admin/require-admin-page";
import { listProjectInquiriesForAdmin } from "@/lib/project-inquiry/store";
import { listProjectsForAdmin } from "@/lib/projects/store";
import { countReviewsByStatus } from "@/lib/reviews/store";
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
  const [inquiriesListed, projectsListed, servicesListed, pendingReviews, publishedReviews, rejectedReviews] =
    await Promise.all([
      listProjectInquiriesForAdmin({ status: "all", limit: 200 }),
      listProjectsForAdmin(),
      listServicesForAdmin(),
      countReviewsByStatus("pending"),
      countReviewsByStatus("published"),
      countReviewsByStatus("rejected"),
    ]);

  const inquiries =
    inquiriesListed.ok && "inquiries" in inquiriesListed
      ? inquiriesListed.inquiries
      : [];
  const projects =
    projectsListed.ok && "projects" in projectsListed
      ? projectsListed.projects
      : [];
  const services =
    servicesListed.ok && "services" in servicesListed
      ? servicesListed.services
      : [];

  const offersLive = services.filter((row) => row.status === "published").length;
  const offersDraft = services.filter((row) => row.status === "draft").length;
  const offersArchived = services.filter((row) => row.status === "archived").length;

  const projectsLive = projects.filter((row) => row.published).length;
  const projectsHidden = projects.length - projectsLive;

  const inquiriesNew = inquiries.filter((row) => row.status === "new").length;
  const inquiriesUnread = inquiries.filter(
    (row) => row.status === "new" && !row.admin_seen_at
  ).length;
  const inquiriesOpen = inquiries.filter(
    (row) => row.status === "contacted" || row.status === "qualified"
  ).length;
  const inquiriesWon = inquiries.filter((row) => row.status === "won").length;
  const inquiriesClosed = inquiries.filter(
    (row) => row.status === "lost" || row.status === "spam"
  ).length;

  const todoItems: OverviewTodoItem[] = [];
  if (inquiriesUnread > 0) {
    todoItems.push({
      label: t("overview.todoInquiries", { count: inquiriesUnread }),
      href: ADMIN_ROUTES.inquiries,
      tone: "urgent",
    });
  }
  if (pendingReviews > 0) {
    todoItems.push({
      label: t("overview.todoReviews", { count: pendingReviews }),
      href: ADMIN_ROUTES.reviews,
      tone: "attention",
    });
  }
  if (offersDraft > 0) {
    todoItems.push({
      label: t("overview.todoDrafts", { count: offersDraft }),
      href: ADMIN_ROUTES.services,
      tone: "neutral",
    });
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/75 p-6 shadow-[0_24px_80px_-48px_rgb(201_169_106/0.55)] sm:p-8">
        <div
          aria-hidden
          className="absolute -end-20 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-primary/75">
              {t("signedInAs")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-xl truncate text-sm text-foreground/58">
              {user.email}
            </p>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-auto">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              {t("viewSite")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <AdminDashboardOverview
        title={t("overview.title")}
        body={t("overview.body")}
        todoTitle={t("overview.todoTitle")}
        todoItems={todoItems}
        todoNone={t("overview.todoNone")}
        totalLabel={t("overview.total")}
        charts={[
          {
            title: t("overview.chartOffers"),
            summary: t("overview.chartOffersSummary", {
              live: offersLive,
              draft: offersDraft,
            }),
            href: ADMIN_ROUTES.services,
            kind: "offers",
            bars: [
              { label: t("overview.barLive"), value: offersLive, tone: "live" },
              { label: t("overview.barDraft"), value: offersDraft, tone: "attention" },
              { label: t("overview.barArchived"), value: offersArchived, tone: "muted" },
            ],
          },
          {
            title: t("overview.chartProjects"),
            summary: t("overview.chartProjectsSummary", {
              live: projectsLive,
              hidden: projectsHidden,
            }),
            href: ADMIN_ROUTES.projects,
            kind: "projects",
            bars: [
              { label: t("overview.barLive"), value: projectsLive, tone: "live" },
              { label: t("overview.barHidden"), value: projectsHidden, tone: "info" },
            ],
          },
          {
            title: t("overview.chartReviews"),
            summary: t("overview.chartReviewsSummary", {
              live: publishedReviews,
              pending: pendingReviews,
            }),
            href: ADMIN_ROUTES.reviews,
            kind: "reviews",
            bars: [
              { label: t("overview.barLive"), value: publishedReviews, tone: "live" },
              { label: t("overview.barPending"), value: pendingReviews, tone: "attention" },
              { label: t("overview.barRemoved"), value: rejectedReviews, tone: "danger" },
            ],
          },
          {
            title: t("overview.chartInquiries"),
            summary: t("overview.chartInquiriesSummary", {
              fresh: inquiriesNew,
              open: inquiriesOpen,
            }),
            href: ADMIN_ROUTES.inquiries,
            kind: "inquiries",
            bars: [
              { label: t("overview.barNew"), value: inquiriesNew, tone: "attention" },
              { label: t("overview.barOpen"), value: inquiriesOpen, tone: "info" },
              { label: t("overview.barDone"), value: inquiriesWon, tone: "live" },
              { label: t("overview.barClosed"), value: inquiriesClosed, tone: "muted" },
            ],
          },
        ]}
      />
    </div>
  );
}

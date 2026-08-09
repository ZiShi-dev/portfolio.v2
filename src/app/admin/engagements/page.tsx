import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { AdminEngagementsPanel } from "@/components/admin/admin-engagements-panel";
import { getAdminLocale } from "@/lib/admin/i18n";
import { requireAdminPageUser } from "@/lib/admin/require-admin-page";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { listEngagementsForAdmin } from "@/lib/engagements/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.meta" });
  return {
    title: t("engagementsTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminEngagementsPage() {
  const locale = await getAdminLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.dashboard");

  await requireAdminPageUser();

  const listed = await listEngagementsForAdmin();
  const initialEngagements = listed.ok ? listed.engagements : [];
  const initialConfigured = listed.ok ? listed.configured : true;

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
          {t("engagementsPageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground/60">
          {t("engagementsPageSubtitle")}
        </p>
      </div>

      <AdminEngagementsPanel
        initialEngagements={initialEngagements}
        initialConfigured={initialConfigured}
      />
    </div>
  );
}

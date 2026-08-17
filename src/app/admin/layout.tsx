import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPrefetchSite } from "@/components/admin/admin-prefetch-site";
import { AdminShell } from "@/components/admin/admin-shell";
import { CelestialPageSplash } from "@/components/celestial-page-loader";
import { NavigationProgress } from "@/components/navigation-progress";
import { AppToastHost } from "@/components/ui/app-toast";
import { getAdminLocale, getAdminMessages } from "@/lib/admin/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminLocale();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin.meta" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
    manifest: "/admin-manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: "VORZIX Admin",
      statusBarStyle: "black-translucent",
    },
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getAdminLocale();
  setRequestLocale(locale);
  const messages = await getAdminMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CelestialPageSplash />
      <AdminPrefetchSite />
      <NavigationProgress />
      <AdminShell>{children}</AdminShell>
      <AppToastHost />
    </NextIntlClientProvider>
  );
}

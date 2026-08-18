"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  CircleHelp,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquareQuote,
  Orbit,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AdminLanguageSwitcher } from "@/components/admin/admin-language-switcher";
import { AdminPushNotifications } from "@/components/admin/admin-push-notifications";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminPasswordChangeButton } from "@/components/admin/admin-password-change-form";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
};

const NAV_ITEMS = [
  { href: ADMIN_ROUTES.home, label: "title", icon: LayoutDashboard },
  { href: ADMIN_ROUTES.inquiries, label: "inquiriesTitle", icon: Orbit },
  { href: ADMIN_ROUTES.services, label: "servicesTitle", icon: Sparkles },
  { href: ADMIN_ROUTES.projects, label: "projectsTitle", icon: FolderKanban },
  { href: ADMIN_ROUTES.reviews, label: "reviewsTitle", icon: MessageSquareQuote },
  { href: ADMIN_ROUTES.engagements, label: "engagementsTitle", icon: ShieldCheck },
  { href: ADMIN_ROUTES.faqs, label: "faqsTitle", icon: CircleHelp },
  { href: ADMIN_ROUTES.about, label: "aboutStatsTitle", icon: BarChart3 },
  { href: ADMIN_ROUTES.settings, label: "settingsTitle", icon: Share2 },
] as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === ADMIN_ROUTES.home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("admin.dashboard");

  return (
    <nav aria-label={t("title")} className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const active = isActiveRoute(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none transition-all",
              "focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-primary/12 text-primary ring-1 ring-inset ring-primary/20"
                : "text-foreground/62 hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                active
                  ? "border-primary/25 bg-primary/10"
                  : "border-transparent bg-transparent group-hover:border-border group-hover:bg-background/60"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 truncate">{t(item.label)}</span>
            {active ? (
              <span
                aria-hidden
                className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SecurityActions() {
  return (
    <div className="grid gap-2 [&_button]:w-full [&_button]:justify-start">
      <AdminPasswordChangeButton />
      <AdminLogoutButton />
    </div>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const loginRoute = pathname === ADMIN_ROUTES.login;
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  if (loginRoute) {
    return (
      <div className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
        <div aria-hidden className="admin-ambient-bg absolute inset-0 -z-10" />
        <header className="border-b border-border/70 bg-card/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link
              href="/"
              prefetch
              className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              <BrandLogo />
            </Link>
            <div className="flex items-center gap-2">
              <AdminLanguageSwitcher />
              <span className="hidden rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary sm:inline-flex">
                {t("badge")}
              </span>
            </div>
          </div>
        </header>
        <main
          id="admin-main"
          className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col items-center justify-center px-4 py-8 sm:px-6"
        >
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
      <div aria-hidden className="admin-ambient-bg fixed inset-0 -z-10" />

      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
        <div className="flex h-16 w-full items-center gap-3 px-4 sm:px-6">
          <Dialog open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label={t("badge")}
              >
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </DialogTrigger>
            <DialogContent placement="drawer" className="p-0" closeLabel={t("password.close")}>
              <DialogHeader className="border-b border-border px-5 py-5 text-start">
                <DialogTitle className="flex items-center gap-3">
                  <BrandLogo className="[&>div:last-child]:hidden" />
                  {t("badge")}
                </DialogTitle>
                <DialogDescription>{t("dashboard.title")}</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                <AdminNavigation onNavigate={() => setMobileNavigationOpen(false)} />
              </div>
              <div className="border-t border-border p-4">
                <SecurityActions />
              </div>
            </DialogContent>
          </Dialog>

          <Link
            href={ADMIN_ROUTES.home}
            className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          >
            <BrandLogo />
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-primary sm:block">
              {t("badge")}
            </span>
          </Link>

          <div className="ms-auto flex items-center gap-2">
            <AdminPushNotifications />
            <AdminLanguageSwitcher />
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                {t("layout.backToSite", { name: "Site" })}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" className="sm:hidden">
              <Link href="/" target="_blank" rel="noopener noreferrer" aria-label={t("layout.backToSite", { name: "Site" })}>
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid w-full grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] border-e border-border/70 bg-card/50 lg:flex lg:flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
            <AdminNavigation />
          </div>
          <div className="border-t border-border/70 bg-background/35 p-4">
            <div className="mb-3 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/42">
              <Settings className="h-3.5 w-3.5" aria-hidden />
              {t("dashboard.openSettings")}
            </div>
            <SecurityActions />
          </div>
        </aside>

        <main id="admin-main" className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

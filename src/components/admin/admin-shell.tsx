"use client";

import { useState, type ReactNode } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
import { getLocaleDirection, type Locale } from "@/i18n/routing";
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
    <nav aria-label={t("title")} className="flex flex-col gap-1">
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
              "group relative flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border px-3 text-sm font-medium outline-none transition-[color,background-color,border-color] duration-200 ease-out",
              "focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-border-gold bg-primary/8 text-primary"
                : "border-transparent text-foreground/70 hover:border-border hover:bg-surface-elevated/70 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 py-2 [overflow-wrap:anywhere]">{t(item.label)}</span>
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
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const loginRoute = pathname === ADMIN_ROUTES.login;
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const dir = getLocaleDirection(locale);

  if (loginRoute) {
    return (
      <DirectionProvider dir={dir}>
      <div className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
        <div aria-hidden className="admin-ambient-bg absolute inset-0 -z-10" />
        <header className="border-b border-border bg-background pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          <div className="mx-auto flex h-14 max-w-5xl min-w-0 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
            <Link
              href="/"
              prefetch
              className="min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              <BrandLogo className="[&>div:last-child]:max-sm:sr-only" />
            </Link>
            <div className="ms-auto flex shrink-0 items-center gap-2">
              <AdminLanguageSwitcher />
              <span className="hidden rounded-[var(--radius-sm)] border border-border-gold px-2.5 py-1 text-xs font-medium text-primary md:inline-flex">
                {t("badge")}
              </span>
            </div>
          </div>
        </header>
        <main
          id="admin-main"
          className="mx-auto flex min-h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] w-full max-w-5xl flex-col items-center justify-center px-4 py-8 sm:min-h-[calc(100dvh-4rem-env(safe-area-inset-top))] sm:px-6"
        >
          {children}
        </main>
      </div>
      </DirectionProvider>
    );
  }

  return (
    <DirectionProvider dir={dir}>
    <div className="relative min-h-dvh overflow-x-clip bg-background text-foreground">
      <div aria-hidden className="admin-ambient-bg fixed inset-0 -z-10" />

      <header className="sticky top-0 z-40 w-full border-b border-border bg-background pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="flex h-14 w-full min-w-0 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
          <Dialog open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 touch-manipulation select-none lg:hidden"
                aria-label={t("layout.menu")}
              >
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </DialogTrigger>
            <DialogContent
              placement="drawer"
              className="p-0 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] [&>button]:top-[max(0.75rem,env(safe-area-inset-top))] [&>button]:h-11 [&>button]:w-11"
              closeLabel={t("password.close")}
            >
              <DialogHeader className="border-b border-border py-5 ps-5 pe-14 text-start">
                <DialogTitle className="flex items-center gap-3">
                  <BrandLogo className="[&>div:last-child]:hidden" />
                  {t("badge")}
                </DialogTitle>
                <DialogDescription>{t("dashboard.title")}</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                <AdminNavigation onNavigate={() => setMobileNavigationOpen(false)} />
              </div>
              <div className="border-t border-border px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <SecurityActions />
              </div>
            </DialogContent>
          </Dialog>

          <Link
            href={ADMIN_ROUTES.home}
            className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          >
            <BrandLogo className="min-w-0 [&>div:last-child]:max-sm:sr-only" />
            <span className="hidden h-5 w-px shrink-0 bg-border lg:block" aria-hidden />
            <span className="hidden shrink-0 text-xs font-medium text-primary lg:block">
              {t("badge")}
            </span>
          </Link>

          <div className="ms-auto flex shrink-0 items-center gap-2">
            <AdminPushNotifications />
            <AdminLanguageSwitcher />
            <Button asChild variant="outline" size="sm" className="hidden h-11 touch-manipulation md:inline-flex">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                {t("layout.backToSite", { name: "Site" })}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" className="h-11 w-11 shrink-0 touch-manipulation select-none md:hidden">
              <Link href="/" target="_blank" rel="noopener noreferrer" aria-label={t("layout.backToSite", { name: "Site" })}>
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid w-full grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="sticky top-[calc(4rem+env(safe-area-inset-top))] hidden h-[calc(100dvh-4rem-env(safe-area-inset-top))] border-e border-border/70 bg-card/50 lg:flex lg:flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
            <AdminNavigation />
          </div>
          <div className="border-t border-border/70 bg-background/35 p-4">
            <div className="mb-3 flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
              <Settings className="h-3.5 w-3.5" aria-hidden />
              {t("dashboard.openSettings")}
            </div>
            <SecurityActions />
          </div>
        </aside>

        <main id="admin-main" className="min-w-0 px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-8 sm:pb-[max(2rem,env(safe-area-inset-bottom))] xl:px-10 xl:pt-10">
          {children}
        </main>
      </div>
    </div>
    </DirectionProvider>
  );
}

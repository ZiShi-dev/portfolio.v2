"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  ArrowUpRight,
  ArrowRight,
  Home,
  CircleHelp,
  Compass,
  Layers,
  Menu,
  MessageSquareQuote,
  PenLine,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ContactOpenLink } from "@/components/contact-open-link";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { openLeaveReviewModal } from "@/lib/open-leave-review-modal";
import { homeSectionUrl, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useModalA11y } from "@/hooks/use-modal-a11y";
import { lockBodyScroll } from "@/lib/lock-body-scroll";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  openReview?: boolean;
};

const NAV_ICONS: Record<string, LucideIcon> = {
  services: Sparkles,
  projects: Layers,
  engagements: ShieldCheck,
  faq: CircleHelp,
  about: Compass,
  reviews: MessageSquareQuote,
  "leave-review": PenLine,
};

function isActiveHref(href: string, pathname: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navbar VORZIX — une seule ligne, jamais de wrap, LTR/RTL.
 * Structure : Logo | liens (desktop) | langue + CTA + menu
 */
export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const menuId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  useModalA11y(open, panelRef);

  const primary: NavItem[] = [
    { id: "services", label: t("services"), href: routes.services, icon: NAV_ICONS.services },
    { id: "projects", label: t("projects"), href: routes.projects, icon: NAV_ICONS.projects },
    {
      id: "engagements",
      label: t("engagements"),
      href: homeSectionUrl("engagements"),
      icon: NAV_ICONS.engagements,
    },
    { id: "faq", label: t("faq"), href: homeSectionUrl("faq"), icon: NAV_ICONS.faq },
  ];

  const more: NavItem[] = [
    { id: "about", label: t("about"), href: homeSectionUrl("about"), icon: NAV_ICONS.about },
    { id: "reviews", label: t("reviews"), href: routes.reviews, icon: NAV_ICONS.reviews },
  ];

  const leaveReview: NavItem = {
    id: "leave-review",
    label: t("leaveReview"),
    href: "#",
    icon: NAV_ICONS["leave-review"],
    openReview: true,
  };

  const secondary = [
    { id: "home", label: t("home"), href: routes.home, icon: Home },
    ...primary.slice(2),
    ...more,
  ];

  const handleItem = useCallback(
    (item: NavItem, e: React.MouseEvent<HTMLAnchorElement>) => {
      if (item.openReview) {
        openLeaveReviewModal(e);
        setOpen(false);
        return;
      }
      setOpen(false);
    },
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const unlock = lockBodyScroll();
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);


  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative mx-auto w-full min-w-0 max-w-5xl">
        <div
          className={cn(
            "relative z-50 flex h-14 w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-full border px-1.5 transition-colors duration-300 sm:gap-3 sm:px-3",
            scrolled
              ? "border-border bg-surface/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              : "border-border bg-surface/80 backdrop-blur-md"
          )}
        >
          <Link
            href={routes.home}
            className="min-w-0 shrink rounded-lg ps-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            onClick={() => setOpen(false)}
          >
            <BrandLogo />
          </Link>

          <nav
            className="mx-auto hidden min-w-0 flex-1 items-center justify-center lg:flex"
            aria-label={t("menu")}
          >
            <ul className="flex list-none flex-nowrap items-center gap-1">
              {primary.map((item) => {
                const active = isActiveHref(item.href, pathname);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-sm transition-colors outline-none",
                        "focus-visible:ring-2 focus-visible:ring-primary/45",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-surface-elevated hover:text-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ms-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="flex h-9 items-center rounded-full border border-border bg-background/60 px-0.5">
              <LanguageSwitcher compact embedded />
            </div>

            <Button
              asChild
              size="sm"
              className="hidden h-9 whitespace-nowrap rounded-full px-3.5 text-sm sm:inline-flex"
            >
              <ContactOpenLink onOpen={() => setOpen(false)}>
                {t("workTogetherShort")}
              </ContactOpenLink>
            </Button>

            <button
              type="button"
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-background/60 text-foreground outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-primary/45",
                open
                  ? "border-primary/40 text-primary"
                  : "border-border hover:border-primary/40 hover:text-primary"
              )}
              aria-label={open ? t("closeMenu") : t("menu")}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                aria-hidden="true"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.16 }}
                className="fixed inset-0 z-40 bg-background/60 backdrop-blur-[3px]"
                onClick={() => setOpen(false)}
              />
              <motion.div
                ref={panelRef} id={menuId} role="dialog" aria-modal="true"
                aria-labelledby={menuId + "-title"}
                initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
                className="absolute end-0 top-[calc(100%+0.75rem)] z-50 flex max-h-[calc(100dvh-6rem)] w-full flex-col overflow-hidden rounded-3xl border border-primary/20 bg-surface shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)] sm:max-w-[30rem]"
              >
                <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6">
                  <div>
                    <h2 id={menuId + "-title"} className="font-display text-xl font-semibold text-foreground">{t("explore")}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("menuSubtitle")}</p>
                  </div>
                  <button type="button" data-modal-initial-focus aria-label={t("closeMenu")} onClick={() => setOpen(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="overflow-y-auto overscroll-contain px-3 pb-3 sm:px-4">
                  <nav aria-label={t("menu")}>
                    <ul className="grid grid-cols-2 gap-2">
                      {primary.slice(0, 2).map((item) => {
                        const Icon = item.icon;
                        const active = isActiveHref(item.href, pathname);
                        return (
                          <li key={item.id}>
                            <Link href={item.href} onClick={(e) => handleItem(item, e)} aria-current={active ? "page" : undefined} className={cn("group flex h-full flex-col gap-3 rounded-2xl border p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", active ? "border-primary/35 bg-primary/10" : "border-border bg-surface-elevated hover:border-primary/30 hover:bg-surface-high")}>
                              <span className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary"><Icon className="h-4 w-4" aria-hidden /></span><ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary rtl:-rotate-90" aria-hidden /></span>
                              <span><span className="block text-sm font-semibold text-foreground">{item.label}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{t(item.id === "services" ? "offersHint" : "projectsHint")}</span></span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <ul className="mt-3 grid grid-cols-2 gap-1 border-t border-border pt-3">
                      {secondary.map((item) => {
                        const Icon = item.icon;
                        const active = isActiveHref(item.href, pathname);
                        return <li key={item.id}><Link href={item.href} onClick={(e) => handleItem(item, e)} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", active ? "bg-primary/10 text-primary" : "text-foreground/75 hover:bg-surface-elevated hover:text-primary")}><Icon className="h-4 w-4 shrink-0 text-primary/70" aria-hidden /><span>{item.label}</span></Link></li>;
                      })}
                      <li><button type="button" onClick={() => { setOpen(false); window.requestAnimationFrame(() => openLeaveReviewModal()); }} className="flex min-h-12 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-start text-sm text-foreground/75 transition-colors hover:bg-surface-elevated hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"><PenLine className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />{leaveReview.label}</button></li>
                    </ul>
                  </nav>
                </div>
                <div className="shrink-0 border-t border-border bg-surface-elevated/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <Button asChild className="w-full rounded-xl"><ContactOpenLink onOpen={() => setOpen(false)}>{t("workTogether")}<ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden /></ContactOpenLink></Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

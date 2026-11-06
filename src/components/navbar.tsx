"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  Home,
  CircleHelp,
  Compass,
  Layers,
  MessageSquareQuote,
  PenLine,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { openLeaveReviewModal } from "@/lib/open-leave-review-modal";
import { homeSectionUrl, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useModalA11y } from "@/hooks/use-modal-a11y";
import { lockBodyScroll } from "@/lib/lock-body-scroll";
import { waitAndScrollToHash } from "@/lib/scroll-to-section";

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
  const router = useRouter();
  const pendingAction = useRef<(() => void) | null>(null);
  const menuId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
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

  /** Entrées du menu déployé — une seule colonne « fiche catalogue » (charte VORZIX). */
  const drawerLinkItems: NavItem[] = [
    { id: "home", label: t("home"), href: routes.home, icon: Home },
    ...primary,
    ...more,
  ];

  function navigateAfterClose(navigate: () => void) {
    if (open) {
      pendingAction.current = navigate;
      setOpen(false);
    } else navigate();
  }

  const handleItem = useCallback(
    (item: NavItem, e: React.MouseEvent<HTMLAnchorElement>) => {
      if (item.openReview) {
        openLeaveReviewModal(e);
        setOpen(false);
        return;
      }
      if (item.href === routes.home && pathname === routes.home && !e.defaultPrevented
        && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        const goHome = () => {
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
          waitAndScrollToHash("#main-content");
        };
        if (open) pendingAction.current = goHome;
        else goHome();
      }
      if (open && !e.defaultPrevented && e.button === 0
        && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        pendingAction.current = () => router.push(item.href);
      }
      setOpen(false);
    },
    [open, router, pathname]
  );

  useEffect(() => {
    const onScroll = () => {
      if (document.body.style.position === "fixed") return;
      setScrolled(window.scrollY > 16);
      let current = "";
      if (pathname === routes.home) {
        for (const id of ["engagements", "a-propos", "faq"]) {
          const section = document.getElementById(id);
          if (section && section.getBoundingClientRect().top <= 180) current = id;
        }
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const itemIsActive = (item: NavItem) => item.href.includes("#")
    ? pathname === routes.home && item.href.split("#")[1] === activeSection
    : isActiveHref(item.href, pathname) && !(item.href === routes.home && activeSection);

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
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="relative mx-auto w-full min-w-0 max-w-6xl">
        <div className={cn(
          "relative z-50 overflow-hidden rounded-2xl border transition-colors duration-200",
          scrolled || open
            ? "border-border/60 bg-surface-elevated/92 shadow-[0_1px_0_0_rgba(244,241,232,0.06)] backdrop-blur-xl"
            : "border-border/40 bg-surface/90 backdrop-blur-md"
        )}>
        <div className={cn(
          "flex h-16 items-center gap-3 px-3 sm:px-5"
        )}>
          <Link href={routes.home} onClick={(e) => handleItem({ id: "home", label: t("home"), href: routes.home, icon: Home }, e)} className="min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <BrandLogo />
          </Link>
          <nav className="mx-auto hidden items-center lg:flex" aria-label={t("menu")}>
            <ul className="flex items-center gap-1">
              {primary.map((item) => {
                const active = itemIsActive(item);
                return <li key={item.id}>
                  <Link href={item.href} onClick={(e) => handleItem(item, e)} aria-current={active ? (item.href.includes("#") ? "location" : "page") : undefined} className={cn("relative flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", active ? "text-primary" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
                    {active && <span className="h-1 w-1 rounded-full bg-primary" aria-hidden />}{item.label}
                  </Link>
                </li>;
              })}
            </ul>
          </nav>
          <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <Button asChild size="sm" className="hidden min-h-11 rounded-xl px-4 md:inline-flex">
              <Link href={routes.startProject} onClick={(e) => handleItem({ id: "start", label: "", href: routes.startProject, icon: ArrowRight }, e)}>{t("workTogetherShort")}<ArrowUpRight className="h-3.5 w-3.5 rtl:-rotate-90" aria-hidden /></Link>
            </Button>
            <button
              type="button"
              className={cn(
                "flex min-h-11 items-center gap-2.5 rounded-xl border px-3 text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
                open
                  ? "border-border-gold/35 bg-primary/[0.09] text-primary shadow-[0_0_0_1px_rgba(201,169,106,0.08)]"
                  : "border-border/55 bg-surface/50 text-foreground/90 hover:border-border-gold/25 hover:bg-surface-elevated/70"
              )}
              aria-label={open ? t("closeMenu") : t("menu")}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((value) => !value)}
            >
              <span>{t("menu")}</span>
              <span className="relative flex h-4 w-4 items-center justify-center" aria-hidden>
                <span className={cn("absolute h-px w-4 bg-current transition-transform duration-200 motion-reduce:transition-none", open ? "rotate-45" : "-translate-y-0.5")} />
                <span className={cn("absolute h-px w-4 bg-current transition-transform duration-200 motion-reduce:transition-none", open ? "-rotate-45" : "translate-y-0.5")} />
              </span>
            </button>
          </div>
        </div>
        </div>
        <AnimatePresence onExitComplete={() => {
          const action = pendingAction.current;
          pendingAction.current = null;
          action?.();
        }}>
          {open && <>
            <motion.div aria-hidden="true" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="fixed inset-0 z-40 bg-background/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div ref={panelRef} id={menuId} role="dialog" aria-modal="true" aria-labelledby={menuId + "-title"} initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -4, scale: reduceMotion ? 1 : 0.985 }} transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }} className="absolute end-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[calc(100dvh-6.5rem)] w-[min(18rem,100%)] origin-top-right flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)] rtl:origin-top-left sm:max-h-[calc(100dvh-8rem)]">
              <h2 id={menuId + "-title"} className="sr-only">
                {t("explore")}
              </h2>
              <div className="min-h-0 overflow-y-auto overscroll-contain">
                <nav aria-label={t("menu")} className="p-1.5">
                  <ul className="flex flex-col gap-0.5">
                    {drawerLinkItems.map((item, index) => {
                      const Icon = item.icon;
                      const active = itemIsActive(item);
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={(e) => handleItem(item, e)}
                            data-modal-initial-focus={index === 0 ? true : undefined}
                            aria-current={
                              active
                                ? item.href.includes("#")
                                  ? "location"
                                  : "page"
                                : undefined
                            }
                            className={cn(
                              "group flex min-h-12 items-center gap-3 rounded-xl px-3 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
                              active
                                ? "bg-primary/[0.08] text-primary"
                                : "text-foreground/90 hover:bg-foreground/[0.04] hover:text-foreground"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                active ? "text-primary" : "text-primary/60 group-hover:text-primary/85"
                              )}
                              strokeWidth={1.5}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">
                              {item.label}
                            </span>
                            <ChevronRight
                              className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary/70 motion-reduce:transform-none rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mx-3 my-1.5 h-px bg-border/55" aria-hidden />
                  <button
                    type="button"
                    onClick={() =>
                      navigateAfterClose(() => openLeaveReviewModal())
                    }
                    className="flex w-full min-h-11 items-center gap-3 rounded-xl px-3 text-start text-sm text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
                  >
                    <PenLine className="h-[18px] w-[18px] shrink-0 text-primary/55" strokeWidth={1.5} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{t("leaveReview")}</span>
                  </button>
                </nav>
              </div>
              <div className="shrink-0 border-t border-border/55 p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
                <Link href={routes.startProject} onClick={(e) => handleItem({ id: "start", label: "", href: routes.startProject, icon: ArrowRight }, e)} className="group flex min-h-12 items-center justify-between gap-3 rounded-xl bg-primary px-4 text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated">
                  <span className="truncate text-[0.9375rem] font-semibold">{t("workTogether")}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none rtl:-rotate-90" aria-hidden />
                </Link>
              </div>
            </motion.div>
          </>}
        </AnimatePresence>
      </div>
    </header>
  );
}

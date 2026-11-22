"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  Home,
  Mail,
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
import { LanguageSwitcher } from "@/components/language-switcher";
import { navContactEntries, useNavContact } from "@/components/nav-contact";
import { Button } from "@/components/ui/button";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { getLocaleDirection, localeLabels, type Locale } from "@/i18n/routing";
import type { FooterSocialId } from "@/lib/brand";
import { SiDiscord, SiFacebook, SiInstagram, SiTiktok, SiWhatsapp } from "react-icons/si";
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
  /** Section d’accueil que cette entrée représente. */
  sectionId?: string;
  openReview?: boolean;
};

const CONTACT_ICONS: Record<FooterSocialId, React.ComponentType<{ className?: string }>> = {
  discord: SiDiscord,
  whatsapp: SiWhatsapp,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  facebook: SiFacebook,
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

/** Ordre réel des sections sur l’accueil. Avis est avant À propos. */
const HOME_SECTION_ORDER = ["projets", "services", "engagements", "avis", "a-propos", "faq"] as const;

function isActiveHref(href: string, pathname: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Section dont le haut a passé le bas du menu. Vide = hero, donc Accueil. */
function sectionUnderHeader() {
  const header = document.querySelector("header");
  const line = (header?.getBoundingClientRect().bottom ?? 96) + 8;
  let current = "";
  for (const id of HOME_SECTION_ORDER) {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= line) current = id;
  }
  return current;
}

/**
 * Navbar VORZIX — une seule ligne, jamais de wrap, LTR/RTL.
 * Structure : Logo | liens (desktop) | langue + contact + CTA + menu
 */
export function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tFooter = useTranslations("footer");
  const tContact = useTranslations("floatingContact");
  const locale = useLocale() as Locale;
  const direction = getLocaleDirection(locale);
  const contact = useNavContact();
  const contactItems = navContactEntries(contact, tContact("email"));
  const pathname = usePathname();
  const router = useRouter();
  const pendingAction = useRef<(() => void) | null>(null);
  const chosenSection = useRef<string | null>(null);
  const menuId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState<"language" | "contact" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const contactButtonRef = useRef<HTMLButtonElement>(null);
  const toolPanelRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  useModalA11y(open, panelRef);

  const primary: NavItem[] = [
    { id: "services", label: t("services"), href: routes.services, sectionId: "services", icon: NAV_ICONS.services },
    { id: "projects", label: t("projects"), href: routes.projects, sectionId: "projets", icon: NAV_ICONS.projects },
    {
      id: "engagements",
      label: t("engagements"),
      href: homeSectionUrl("engagements"),
      sectionId: "engagements",
      icon: NAV_ICONS.engagements,
    },
    { id: "faq", label: t("faq"), href: homeSectionUrl("faq"), sectionId: "faq", icon: NAV_ICONS.faq },
  ];

  const more: NavItem[] = [
    { id: "about", label: t("about"), href: homeSectionUrl("about"), sectionId: "a-propos", icon: NAV_ICONS.about },
    { id: "reviews", label: t("reviews"), href: routes.reviews, sectionId: "avis", icon: NAV_ICONS.reviews },
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
      const hashAt = item.href.indexOf("#");
      const hash = hashAt >= 0 ? item.href.slice(hashAt) : "";
      const plainClick = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
      const samePageSection = hash.length > 1
        && pathname === routes.home
        && (hashAt === 0 || item.href.slice(0, hashAt) === routes.home);

      if (item.href === routes.home && pathname === routes.home && !e.defaultPrevented && plainClick) {
        e.preventDefault();
        const goHome = () => {
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
          chosenSection.current = null;
          setActiveSection("");
          waitAndScrollToHash("#main-content");
        };
        if (open) pendingAction.current = goHome;
        else goHome();
      } else if (samePageSection && plainClick) {
        const sectionId = item.sectionId ?? hash.slice(1);
        chosenSection.current = sectionId;
        setActiveSection(sectionId);
        if (open && !e.defaultPrevented) {
          e.preventDefault();
          pendingAction.current = () => {
            if (window.location.hash !== hash) {
              window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
            }
            waitAndScrollToHash(hash);
          };
        }
      } else if (open && !e.defaultPrevented && plainClick) {
        e.preventDefault();
        pendingAction.current = () => router.push(item.href);
      }
      setOpen(false);
    },
    [open, router, pathname]
  );

  useEffect(() => {
    const releaseChosen = () => {
      chosenSection.current = null;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]")) return;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) releaseChosen();
    };
    window.addEventListener("wheel", releaseChosen, { passive: true });
    window.addEventListener("touchmove", releaseChosen, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", releaseChosen);
      window.removeEventListener("touchmove", releaseChosen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const locked = document.body.style.position === "fixed"
        || Number(document.documentElement.dataset.scrollLockCount ?? "0") > 0;
      if (locked) return;
      setScrolled(window.scrollY > 16);
      if (pathname === routes.home && chosenSection.current) {
        setActiveSection(chosenSection.current);
        return;
      }
      setActiveSection(pathname === routes.home ? sectionUnderHeader() : "");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [pathname]);

  const itemIsActive = (item: NavItem) => {
    if (pathname === routes.home) {
      if (!item.sectionId) return activeSection === "";
      return item.sectionId === activeSection;
    }
    return item.sectionId ? isActiveHref(item.href, pathname) : false;
  };

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

  useLayoutEffect(() => {
    if (!tool) return;
    const button = tool === "language" ? languageButtonRef.current : contactButtonRef.current;
    const bar = barRef.current;
    if (!button || !bar) return;
    const place = () => {
      const panel = toolPanelRef.current;
      if (!panel) return;
      const barBox = bar.getBoundingClientRect();
      const buttonBox = button.getBoundingClientRect();
      const aligned = Math.max(0, barBox.right - buttonBox.right);
      const fitted = Math.max(0, barBox.width - panel.offsetWidth);
      panel.style.right = `${Math.min(aligned, fitted)}px`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [tool]);

  useEffect(() => {
    if (!tool) return;
    const button = tool === "language" ? languageButtonRef.current : contactButtonRef.current;
    const frame = requestAnimationFrame(() => {
      toolPanelRef.current?.querySelector<HTMLElement>('[aria-current="true"], a')?.focus({ preventScroll: true });
    });
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (toolPanelRef.current?.contains(target) || button?.contains(target)) return;
      setTool(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTool(null);
        button?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
      const panel = toolPanelRef.current;
      if (!panel) return;
      const here = panel.contains(document.activeElement) || button?.contains(document.activeElement);
      if (!here) return;
      const items = [...panel.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]")];
      if (items.length === 0) return;
      event.preventDefault();
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next = event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : index < 0
            ? event.key === "ArrowUp" ? items.length - 1 : 0
            : event.key === "ArrowDown"
              ? (index + 1) % items.length
              : (index - 1 + items.length) % items.length;
      items[next]?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [tool]);


  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div ref={barRef} dir="ltr" className="relative mx-auto w-full min-w-0 max-w-6xl">
        <div className={cn(
          "relative z-50 overflow-hidden rounded-2xl border transition-colors duration-200",
          scrolled || open
            ? "border-border/60 bg-surface-elevated/92 shadow-[0_1px_0_0_rgba(244,241,232,0.06)] backdrop-blur-xl"
            : "border-border/40 bg-surface/90 backdrop-blur-md"
        )}>
        <div className={cn(
          "flex h-16 items-center gap-3 px-3 sm:px-5"
        )}>
          <Link href={routes.home} onClick={(e) => handleItem({ id: "home", label: t("home"), href: routes.home, icon: Home }, e)} className="min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <BrandLogo />
          </Link>
          <nav dir={direction} className="mx-auto hidden items-center lg:flex" aria-label={t("menu")}>
            <ul className="flex items-center gap-1">
              {primary.map((item) => {
                const active = itemIsActive(item);
                const Icon = item.icon;
                return <li key={item.id}>
                  <Link href={item.href} onClick={(e) => handleItem(item, e)} aria-current={active ? (item.href.includes("#") ? "location" : "page") : undefined} className={cn("relative flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", active ? "text-primary" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-primary/70")} strokeWidth={1.5} aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                </li>;
              })}
            </ul>
          </nav>
          <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              ref={languageButtonRef}
              type="button"
              className={cn(
                "flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-2.5 font-mono text-[11px] tracking-[0.16em] transition-[color,background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                tool === "language"
                  ? "border-border-gold/35 bg-primary/[0.09] text-primary"
                  : "border-border/55 bg-surface/50 text-foreground/90 hover:border-border-gold/25 hover:bg-surface-elevated/70"
              )}
              aria-label={`${tCommon("language")}, ${localeLabels[locale]}`}
              aria-expanded={tool === "language"}
              aria-controls={tool === "language" ? "nav-language" : undefined}
              onClick={() => {
                setOpen(false);
                setTool((current) => (current === "language" ? null : "language"));
              }}
            >
              {locale.toUpperCase()}
            </button>
            {contactItems.length > 0 ? (
              <button
                ref={contactButtonRef}
                type="button"
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl border px-2.5 text-sm font-medium transition-[color,background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-3",
                  tool === "contact"
                    ? "border-border-gold/35 bg-primary/[0.09] text-primary"
                    : "border-border/55 bg-surface/50 text-foreground/90 hover:border-border-gold/25 hover:bg-surface-elevated/70"
                )}
                aria-label={tool === "contact" ? tContact("close") : tContact("open")}
                aria-expanded={tool === "contact"}
                aria-controls={tool === "contact" ? "nav-contact" : undefined}
                onClick={() => {
                  setOpen(false);
                  setTool((current) => (current === "contact" ? null : "contact"));
                }}
              >
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="hidden sm:inline">{tFooter("contact")}</span>
              </button>
            ) : null}
            <Button asChild size="sm" className="hidden min-h-11 rounded-xl px-4 md:inline-flex">
              <Link href={routes.startProject} onClick={(e) => handleItem({ id: "start", label: "", href: routes.startProject, icon: ArrowRight }, e)}>{t("workTogetherShort")}<ArrowUpRight className="h-3.5 w-3.5 rtl:-rotate-90" aria-hidden /></Link>
            </Button>
            <button
              type="button"
              className={cn(
                "flex min-h-11 items-center gap-2.5 rounded-xl border px-3 text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                open
                  ? "border-border-gold/35 bg-primary/[0.09] text-primary shadow-[0_0_0_1px_rgba(201,169,106,0.08)]"
                  : "border-border/55 bg-surface/50 text-foreground/90 hover:border-border-gold/25 hover:bg-surface-elevated/70"
              )}
              aria-label={open ? t("closeMenu") : t("menu")}
              aria-expanded={open}
              aria-controls={open ? menuId : undefined}
              onClick={() => {
                if (!open && pathname === routes.home && !chosenSection.current) {
                  setActiveSection(sectionUnderHeader());
                }
                setTool(null);
                setOpen((value) => !value);
              }}
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
        {tool ? (
          <div
            ref={toolPanelRef}
            id={tool === "language" ? "nav-language" : "nav-contact"}
            role="dialog"
            aria-label={tool === "language" ? tCommon("language") : tContact("menuLabel")}
            dir={tool === "language" ? "ltr" : direction}
            className="absolute top-[calc(100%+0.5rem)] z-50 w-[min(16.5rem,calc(100vw-1.5rem))] rounded-2xl border border-border/60 bg-surface-elevated p-1.5 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)]"
          >
            {tool === "language" ? (
              <LanguageSwitcher
                embedded
                onNavigate={(navigate) => {
                  setTool(null);
                  navigate();
                }}
              />
            ) : (
              <ul className="flex flex-col gap-0.5">
                {contactItems.map((item) => {
                  const Icon = item.id === "email" ? Mail : CONTACT_ICONS[item.id as FooterSocialId];
                  return (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        aria-label={item.id === "email" ? tContact("emailLabel") : tContact("networkLabel", { network: item.label })}
                        aria-current={item.preferred ? "true" : undefined}
                        onClick={() => setTool(null)}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl px-3 text-start outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
                          item.preferred
                            ? "bg-primary/[0.08] text-primary"
                            : "text-foreground/90 hover:bg-foreground/[0.04] hover:text-foreground"
                        )}
                      >
                        <span className="flex w-8 shrink-0 items-center">
                          <Icon className={cn("h-[18px] w-[18px]", item.preferred ? "text-primary" : "text-primary/60")} strokeWidth={1.5} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
        <AnimatePresence onExitComplete={() => {
          const action = pendingAction.current;
          pendingAction.current = null;
          action?.();
        }}>
          {open && <>
            <motion.div aria-hidden="true" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="fixed inset-0 z-40 bg-background/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div ref={panelRef} id={menuId} dir={direction} role="dialog" aria-modal="true" aria-labelledby={menuId + "-title"} initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -4, scale: reduceMotion ? 1 : 0.985 }} transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[calc(100dvh-6.5rem)] w-[min(18rem,100%)] origin-top-right flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)] sm:max-h-[calc(100dvh-8rem)]">
              <h2 id={menuId + "-title"} className="sr-only">
                {t("explore")}
              </h2>
              <div className="min-h-0 overflow-y-auto overscroll-contain">
                <nav aria-label={t("menu")} className="p-1.5">
                  <ul className="flex flex-col gap-0.5">
                    {drawerLinkItems.map((item) => {
                      const Icon = item.icon;
                      const active = itemIsActive(item);
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={(e) => handleItem(item, e)}
                            data-modal-initial-focus={active ? true : undefined}
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
                            <span className="min-w-0 truncate text-[0.9375rem] font-medium">
                              {item.label}
                            </span>
                            <ChevronRight
                              className="ms-auto h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary/70 motion-reduce:transform-none rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
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

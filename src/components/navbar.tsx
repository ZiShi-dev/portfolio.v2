"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
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

function catalogIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

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

  const drawerGroups = [
    primary.slice(0, 2),
    [...primary.slice(2), more[0]!],
    [more[1]!],
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
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  let linkIndex = 0;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative mx-auto w-full max-w-5xl">
        <div
          className={cn(
            "relative z-50 flex h-12 w-full items-center gap-2 rounded-full border px-2 transition-colors duration-300 sm:h-14 sm:gap-3 sm:px-3",
            scrolled
              ? "border-border bg-surface/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              : "border-border bg-surface/80 backdrop-blur-md"
          )}
        >
          <Link
            href={routes.home}
            className="shrink-0 rounded-lg ps-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
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

          <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="flex h-9 items-center rounded-full border border-border bg-background/60 px-0.5">
              <LanguageSwitcher compact embedded />
            </div>

            <Button
              asChild
              size="sm"
              className="h-9 whitespace-nowrap rounded-full px-3.5 text-sm"
            >
              <ContactOpenLink onOpen={() => setOpen(false)}>
                {t("workTogetherShort")}
              </ContactOpenLink>
            </Button>

            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background/60 text-foreground outline-none transition-colors",
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
          {open ? (
            <>
              <motion.button
                type="button"
                aria-label={t("closeMenu")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="fixed inset-0 z-40 cursor-default bg-background/70 backdrop-blur-[2px]"
                onClick={() => setOpen(false)}
              />
              <motion.div
                id={menuId}
                role="dialog"
                aria-modal="true"
                aria-label={t("menu")}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border border-border-gold bg-surface-elevated/95 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:max-w-[22rem]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 ps-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    VZ—NAV
                  </p>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-foreground outline-none transition-colors",
                      "hover:border-primary/40 hover:text-primary",
                      "focus-visible:ring-2 focus-visible:ring-primary/45"
                    )}
                    aria-label={t("closeMenu")}
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </button>
                </div>

                <nav aria-label={t("menu")}>
                  {drawerGroups.map((group, groupIndex) => (
                    <ul
                      key={groupIndex}
                      className={cn(
                        "flex list-none flex-col gap-0.5 px-2 py-2",
                        groupIndex > 0 && "border-t border-border"
                      )}
                    >
                      {group.map((item) => {
                        const Icon = item.icon;
                        const index = linkIndex++;
                        const active = isActiveHref(item.href, pathname);
                        return (
                          <li key={item.id}>
                            <Link
                              href={item.href}
                              onClick={(e) => handleItem(item, e)}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm outline-none transition-colors",
                                "focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated",
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground/85 hover:bg-surface-high hover:text-primary"
                              )}
                            >
                              <span
                                dir="ltr"
                                className="w-6 shrink-0 font-mono text-[10px] tracking-[0.16em] text-primary/65"
                              >
                                {catalogIndex(index)}
                              </span>
                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  active
                                    ? "text-primary"
                                    : "text-muted-foreground group-hover:text-primary"
                                )}
                                aria-hidden
                                strokeWidth={1.6}
                              />
                              <span className="min-w-0 flex-1 truncate text-start">
                                {item.label}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ))}
                </nav>

                <div className="border-t border-border p-3">
                  <Link
                    href={leaveReview.href}
                    onClick={(e) => handleItem(leaveReview, e)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border-gold bg-background/40 px-4 text-sm text-foreground transition-colors hover:border-primary/45 hover:bg-surface-high hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
                  >
                    <PenLine className="h-4 w-4" aria-hidden strokeWidth={1.6} />
                    {leaveReview.label}
                  </Link>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}

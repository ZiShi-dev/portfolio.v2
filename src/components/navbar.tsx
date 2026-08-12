"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ContactOpenLink } from "@/components/contact-open-link";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { openLeaveReviewModal } from "@/lib/open-leave-review-modal";
import { homeSectionUrl, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  href: string;
  openReview?: boolean;
};

/**
 * Navbar VORZIX — une seule ligne, jamais de wrap, LTR/RTL.
 * Structure : Logo | liens (desktop) | langue + CTA + menu
 */
export function Navbar() {
  const t = useTranslations("nav");
  const menuId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const primary: NavItem[] = [
    { id: "services", label: t("services"), href: routes.services },
    { id: "for-sale", label: t("forSale"), href: routes.forSale },
    { id: "projects", label: t("projects"), href: routes.projects },
    {
      id: "engagements",
      label: t("engagements"),
      href: homeSectionUrl("engagements"),
    },
    { id: "faq", label: t("faq"), href: homeSectionUrl("faq") },
  ];

  const more: NavItem[] = [
    { id: "about", label: t("about"), href: homeSectionUrl("about") },
    { id: "reviews", label: t("reviews"), href: routes.reviews },
    {
      id: "leave-review",
      label: t("leaveReview"),
      href: "#",
      openReview: true,
    },
  ];

  const drawerLinks = [...primary, ...more];

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative mx-auto w-full max-w-5xl">
        <div
          className={cn(
            "flex h-12 w-full items-center gap-2 rounded-full border px-2 transition-colors duration-300 sm:h-14 sm:gap-3 sm:px-3",
            scrolled
              ? "border-border bg-[#0A0E1A]/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              : "border-white/10 bg-[#0A0E1A]/80 backdrop-blur-md"
          )}
        >
          <Link
            href={routes.home}
            className="shrink-0 ps-1"
            onClick={() => setOpen(false)}
          >
            <BrandLogo />
          </Link>

          {/* Liens desktop : 4 max, nowrap strict */}
          <nav
            className="mx-auto hidden min-w-0 flex-1 items-center justify-center lg:flex"
            aria-label={t("menu")}
          >
            <ul className="flex list-none flex-nowrap items-center gap-1">
              {primary.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-sm text-[#F4F1E8]/75 transition-colors hover:bg-white/5 hover:text-[#C9A96A]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="flex h-9 items-center rounded-full border border-white/10 bg-[#070A12]/60 px-0.5">
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#070A12]/60 text-[#F4F1E8] transition-colors hover:border-[#C9A96A]/40 hover:text-[#C9A96A]"
              aria-label={open ? t("closeMenu") : t("menu")}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" strokeWidth={2} /> : <Menu className="h-4 w-4" strokeWidth={2} />}
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
                className="fixed inset-0 z-40 cursor-default bg-black/50"
                onClick={() => setOpen(false)}
              />
              <motion.div
                id={menuId}
                role="dialog"
                aria-modal="true"
                aria-label={t("menu")}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border bg-[#0A0E1A] shadow-2xl"
              >
                <ul className="flex list-none flex-col p-2">
                  {drawerLinks.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={(e) => handleItem(item, e)}
                        className="flex h-11 items-center rounded-xl px-4 text-sm text-[#F4F1E8]/85 transition-colors hover:bg-white/5 hover:text-[#C9A96A]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}

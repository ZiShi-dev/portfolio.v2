"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Mail, MessageCircle, X } from "lucide-react";
import {
  SiDiscord,
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiWhatsapp,
} from "react-icons/si";
import type { FooterSocialId, FooterSocialLink } from "@/lib/brand";
import { getConfiguredSocialLinks } from "@/lib/social/public-links";
import { cn } from "@/lib/utils";

type FloatingContactButtonProps = {
  contactEmail: string;
  socials: FooterSocialLink[];
};

const socialIcons: Record<
  FooterSocialId,
  React.ComponentType<{ className?: string }>
> = {
  discord: SiDiscord,
  whatsapp: SiWhatsapp,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  facebook: SiFacebook,
};

/** Amplitude horizontale de l’arc (px). */
const ARC_AMPLITUDE = 34;

/**
 * Décalage horizontal le long d’un arc vertical (sinusoïde).
 * Les icônes du haut et du bas restent alignées ; le milieu bulge vers l’intérieur.
 */
function getVerticalArcOffset(
  index: number,
  total: number,
  mirrorX: boolean
): number {
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const shift = Math.sin(t * Math.PI) * ARC_AMPLITUDE;
  return mirrorX ? shift : -shift;
}

function ArcGuides({
  itemCount,
  reduceMotion,
}: {
  itemCount: number;
  reduceMotion: boolean;
}) {
  const height = Math.max(120, itemCount * 64 + 16);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -end-6 bottom-2 top-0 w-28"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 112 ${height}`}
        preserveAspectRatio="xMaxYMid meet"
        fill="none"
      >
        {[0.42, 0.62, 0.82].map((scale) => (
          <ellipse
            key={scale}
            cx={96}
            cy={height * 0.52}
            rx={88 * scale}
            ry={height * 0.48 * scale}
            stroke="rgba(201,169,106,0.12)"
            strokeWidth="0.75"
          />
        ))}
      </svg>
    </motion.div>
  );
}

/**
 * Speed dial public alimenté par les réglages sociaux de l'admin.
 * Icônes disposées en arc vertical (courbe) au-dessus du bouton.
 */
export function FloatingContactButton({
  contactEmail,
  socials,
}: FloatingContactButtonProps) {
  const t = useTranslations("floatingContact");
  const locale = useLocale();
  const mirrorX = locale === "ar";
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const configuredSocials = getConfiguredSocialLinks(socials);
  const email = contactEmail?.trim() ?? "";
  const contactItems = [
    ...configuredSocials.map((social) => ({
      id: social.id,
      href: social.href,
      label: social.label,
      preferred: social.preferred,
      external: true,
      Icon: socialIcons[social.id],
    })),
    ...(email
      ? [
          {
            id: "email" as const,
            href: `mailto:${email}`,
            label: t("email"),
            preferred: false,
            external: false,
            Icon: Mail,
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    const focusFrame = window.requestAnimationFrame(() => firstLinkRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (contactItems.length === 0) return null;

  const duration = reduceMotion ? 0 : 0.2;
  const total = contactItems.length;

  return (
    <div
      ref={rootRef}
      className={cn(
        "fixed z-[45] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3",
        "bottom-[max(1rem,env(safe-area-inset-bottom))] end-[max(1rem,env(safe-area-inset-right))]",
        "sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:end-[max(1.5rem,env(safe-area-inset-right))]"
      )}
    >
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={menuId}
            aria-label={t("menuLabel")}
            className="relative"
            style={{ paddingInlineStart: ARC_AMPLITUDE + 4 }}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <ArcGuides itemCount={total} reduceMotion={Boolean(reduceMotion)} />

            <ul className="relative z-[1] flex list-none flex-col items-end gap-2.5">
              {contactItems.map((item, index) => {
                const Icon = item.Icon;
                const arcX = getVerticalArcOffset(index, total, mirrorX);

                return (
                  <motion.li
                    key={item.id}
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, x: arcX + (mirrorX ? -10 : 10), scale: 0.92 }
                    }
                    animate={{ opacity: 1, x: arcX, scale: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: arcX + (mirrorX ? -6 : 6), scale: 0.95 }
                    }
                    transition={{
                      duration,
                      delay: reduceMotion ? 0 : index * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <a
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      aria-label={
                        item.id === "email"
                          ? t("emailLabel")
                          : t("networkLabel", { network: item.label })
                      }
                      title={item.label}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex max-w-[calc(100vw-2rem)] items-center gap-0 outline-none",
                        "focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      )}
                    >
                      <span className="max-w-[min(11rem,calc(100vw-7.5rem))] truncate rounded-full border border-border-gold bg-surface/95 px-3 py-1.5 text-xs font-medium text-foreground/85 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-colors group-hover:border-primary/45 group-hover:text-primary">
                        {item.label}
                      </span>
                      <span
                        className="mx-2 h-px w-5 shrink-0 bg-primary/25 transition-colors group-hover:bg-primary/45"
                        aria-hidden
                      />
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-gold",
                          "bg-surface-elevated/95 text-primary shadow-[0_10px_28px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl",
                          "transition-[transform,border-color,background-color] duration-200 group-hover:scale-105 group-hover:border-primary/55 group-hover:bg-surface-high",
                          "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                          item.preferred && "border-primary/45 bg-primary/10"
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? t("close") : t("open")}
        title={open ? t("close") : t("open")}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border outline-none",
          "border-primary/45 bg-surface-elevated/95 text-primary backdrop-blur-xl",
          "shadow-[0_12px_36px_-12px_rgba(0,0,0,0.95),0_0_28px_-14px_rgba(201,169,106,0.75)]",
          "transition-[transform,border-color,box-shadow] duration-200 hover:scale-105 hover:border-primary/75 hover:shadow-[0_14px_40px_-12px_rgba(0,0,0,0.95),0_0_32px_-10px_rgba(201,169,106,0.65)]",
          "focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "motion-reduce:transition-none motion-reduce:hover:scale-100"
        )}
      >
        <span className="pointer-events-none absolute inset-[5px] rounded-full border border-primary/15" />
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={open ? "close" : "contact"}
            initial={reduceMotion ? false : { opacity: 0, rotate: -25, scale: 0.72 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 25, scale: 0.72 }}
            transition={{ duration: reduceMotion ? 0 : 0.14 }}
            className="relative flex"
          >
            {open ? (
              <X className="h-6 w-6" strokeWidth={1.7} aria-hidden />
            ) : (
              <MessageCircle className="h-6 w-6" strokeWidth={1.7} aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

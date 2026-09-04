"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Mail, Moon, X } from "lucide-react";
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

const TRIGGER_SIZE = 56;
const TRIGGER_CENTER = TRIGGER_SIZE / 2;
const ICON_SIZE = 40;

/** Rayon dynamique : plus d’icônes → arc plus large (évite les chevauchements). */
function getArcRadius(total: number) {
  return 84 + Math.max(0, total - 2) * 26;
}

/** Positions sur un quart de cercle (croissant) autour du bouton déclencheur. */
function getArcOffset(
  index: number,
  total: number,
  radius: number,
  mirrorX: boolean
) {
  const startDeg = 126;
  const endDeg = 212;
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const deg = startDeg + (endDeg - startDeg) * t;
  const rad = (deg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius * (mirrorX ? -1 : 1),
    y: -Math.sin(rad) * radius,
  };
}

/** Halo lunaire discret — hairline uniquement, conforme charte Atlas Céleste. */
function MoonArcGuide({
  radius,
  mirrorX,
  reduceMotion,
}: {
  radius: number;
  mirrorX: boolean;
  reduceMotion: boolean;
}) {
  const size = radius + TRIGGER_CENTER;
  const cx = radius;
  const cy = radius;

  return (
    <motion.svg
      aria-hidden
      className="pointer-events-none absolute bottom-0 end-0 overflow-visible"
      width={size}
      height={size}
      style={{ transform: mirrorX ? "scaleX(-1)" : undefined }}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <defs>
        <radialGradient id="moon-halo" cx="100%" cy="100%" r="75%">
          <stop offset="0%" stopColor="rgba(201,169,106,0.08)" />
          <stop offset="55%" stopColor="rgba(201,169,106,0.02)" />
          <stop offset="100%" stopColor="rgba(201,169,106,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={radius * 0.9} fill="url(#moon-halo)" />
      <path
        d={`M ${cx + radius * 0.68} ${cy - radius * 0.08} A ${radius * 0.85} ${radius * 0.85} 0 0 0 ${cx - radius * 0.08} ${cy + radius * 0.68}`}
        fill="none"
        stroke="rgba(201,169,106,0.18)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

const iconButtonClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-step-accent/20 bg-background/80 text-foreground/60 backdrop-blur-md transition-[transform,border-color,color,box-shadow] duration-200 hover:border-primary/35 hover:text-foreground hover:shadow-[0_0_20px_-10px_rgba(201,169,106,0.35)] motion-reduce:transition-none motion-reduce:hover:scale-100";

/**
 * Speed dial en arc lunaire — icônes seules, libellé au survol (comme le footer).
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

  const arcRadius = getArcRadius(contactItems.length);
  const menuSpread = arcRadius + TRIGGER_SIZE + 20;

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
    const focusFrame = window.requestAnimationFrame(() =>
      firstLinkRef.current?.focus()
    );
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (contactItems.length === 0) return null;

  const duration = reduceMotion ? 0 : 0.2;

  return (
    <div
      ref={rootRef}
      className={cn(
        "fixed z-[45]",
        "bottom-[max(1rem,env(safe-area-inset-bottom))] end-[max(1rem,env(safe-area-inset-right))]",
        "sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:end-[max(1.5rem,env(safe-area-inset-right))]"
      )}
    >
      <div
        className="relative transition-[width,height] duration-200 motion-reduce:transition-none"
        style={{
          width: open ? menuSpread : TRIGGER_SIZE,
          height: open ? menuSpread : TRIGGER_SIZE,
        }}
      >
        <div
          className="absolute bottom-0 end-0"
          style={{ width: TRIGGER_SIZE, height: TRIGGER_SIZE }}
        >
          <AnimatePresence>
            {open ? (
              <MoonArcGuide
                radius={arcRadius}
                mirrorX={mirrorX}
                reduceMotion={Boolean(reduceMotion)}
              />
            ) : null}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.ul
                id={menuId}
                aria-label={t("menuLabel")}
                className="pointer-events-none absolute inset-0 m-0 list-none p-0"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration * 0.8 }}
              >
                {contactItems.map((item, index) => {
                  const Icon = item.Icon;
                  const { x, y } = getArcOffset(
                    index,
                    contactItems.length,
                    arcRadius,
                    mirrorX
                  );
                  const len = Math.hypot(x, y) || 1;
                  const tipX = (x / len) * 52;
                  const tipY = (y / len) * 52;

                  return (
                    <motion.li
                      key={item.id}
                      className="pointer-events-auto absolute"
                      style={{
                        bottom: TRIGGER_CENTER + y - ICON_SIZE / 2,
                        insetInlineEnd: TRIGGER_CENTER - x - ICON_SIZE / 2,
                      }}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, scale: 0.55, y: 8 }
                      }
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.65, y: 6 }
                      }
                      transition={{
                        duration,
                        delay: reduceMotion ? 0 : index * 0.045,
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
                          "group relative flex outline-none",
                          iconButtonClass,
                          item.preferred &&
                            "border-primary/30 text-foreground/80",
                          "focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        )}
                      >
                        <Icon className="h-[1.05rem] w-[1.05rem]" aria-hidden />
                        <span
                          className={cn(
                            "pointer-events-none absolute left-1/2 top-1/2 z-10 whitespace-nowrap rounded-md",
                            "border border-border bg-surface/95 px-2 py-0.5 text-[11px] font-medium text-foreground/80",
                            "opacity-0 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.9)] backdrop-blur-md",
                            "transition-opacity duration-150",
                            "group-hover:opacity-100 group-focus-visible:opacity-100"
                          )}
                          style={{
                            transform: `translate(calc(-50% + ${tipX}px), calc(-50% + ${tipY}px))`,
                          }}
                        >
                          {item.label}
                        </span>
                      </a>
                    </motion.li>
                  );
                })}
              </motion.ul>
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
              "relative z-10 flex h-14 w-14 items-center justify-center rounded-full border outline-none",
              "border-step-accent/25 bg-surface-elevated/95 text-foreground/65 backdrop-blur-md",
              "shadow-[0_10px_32px_-14px_rgba(0,0,0,0.9)]",
              "transition-[transform,border-color,box-shadow,color] duration-200",
              "hover:scale-[1.03] hover:border-primary/35 hover:text-foreground",
              "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "motion-reduce:transition-none motion-reduce:hover:scale-100",
              open && "border-primary/35 text-primary shadow-[0_0_28px_-12px_rgba(201,169,106,0.4)]"
            )}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={open ? "close" : "moon"}
                initial={
                  reduceMotion ? false : { opacity: 0, rotate: -16, scale: 0.8 }
                }
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, rotate: 16, scale: 0.8 }
                }
                transition={{ duration: reduceMotion ? 0 : 0.14 }}
                className="relative flex"
              >
                {open ? (
                  <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Moon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
}

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

/** Positions le long d’un arc de croissant (quart de lune autour du bouton). */
function getArcOffset(
  index: number,
  total: number,
  radius: number,
  mirrorX: boolean
) {
  const startDeg = 108;
  const endDeg = 198;
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const deg = startDeg + (endDeg - startDeg) * t;
  const rad = (deg * Math.PI) / 180;
  const x = Math.cos(rad) * radius * (mirrorX ? -1 : 1);
  const y = -Math.sin(rad) * radius;
  return { x, y };
}

function MoonCrescent({
  radius,
  mirrorX,
  reduceMotion,
}: {
  radius: number;
  mirrorX: boolean;
  reduceMotion: boolean;
}) {
  const size = radius * 2.15;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-0 end-0"
      style={{
        width: size,
        height: size,
        marginBottom: TRIGGER_CENTER - size * 0.08,
        marginInlineEnd: TRIGGER_CENTER - size * 0.08,
        transform: mirrorX ? "scaleX(-1)" : undefined,
      }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Halo lunaire */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 72% 72%, rgba(201,169,106,0.14) 0%, rgba(201,169,106,0.04) 38%, transparent 68%)",
        }}
      />
      {/* Croissant — deux disques décalés */}
      <div
        className="absolute inset-[6%] rounded-full border border-primary/10"
        style={{
          boxShadow:
            "inset -6px 6px 18px -4px rgba(201,169,106,0.12), 0 0 40px -8px rgba(201,169,106,0.18)",
        }}
      />
      <div
        className="absolute rounded-full bg-background"
        style={{
          width: "78%",
          height: "78%",
          top: "4%",
          insetInlineEnd: "-8%",
          boxShadow: "inset 0 0 20px rgba(7,10,18,0.6)",
        }}
      />
      {/* Arc hairline le long du croissant */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M 78 22 A 42 42 0 0 0 22 78"
          stroke="rgba(201,169,106,0.22)"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

/**
 * Speed dial en arc de lune — réseaux depuis les réglages admin.
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

  const arcRadius =
    contactItems.length <= 2 ? 76 : contactItems.length <= 4 ? 88 : 100;

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

  const duration = reduceMotion ? 0 : 0.22;

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
        className="relative"
        style={{ width: TRIGGER_SIZE, height: TRIGGER_SIZE }}
      >
        <AnimatePresence>
          {open ? (
            <MoonCrescent
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
              className="pointer-events-none absolute inset-0 list-none"
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
                const centerX = TRIGGER_CENTER + x;
                const centerY = TRIGGER_CENTER + y;

                return (
                  <motion.li
                    key={item.id}
                    className="pointer-events-auto absolute"
                    style={{
                      left: centerX,
                      top: centerY,
                      transform: "translate(-50%, -50%)",
                    }}
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            scale: 0.5,
                            x: mirrorX ? -10 : 10,
                            y: 10,
                          }
                    }
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.6, x: mirrorX ? -6 : 6, y: 6 }
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
                        "group flex items-center gap-2 outline-none",
                        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                          "bg-surface-elevated/95 text-foreground/75 shadow-[0_8px_22px_-10px_rgba(0,0,0,0.85)] backdrop-blur-xl",
                          "transition-[transform,border-color,color,box-shadow] duration-200",
                          "group-hover:scale-105 group-hover:border-primary/30 group-hover:text-foreground",
                          "group-hover:shadow-[0_10px_26px_-8px_rgba(0,0,0,0.9),0_0_18px_-10px_rgba(201,169,106,0.35)]",
                          "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                          item.preferred
                            ? "border-primary/25 text-foreground/90"
                            : "border-border"
                        )}
                      >
                        <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
                      </span>
                      <span
                        className={cn(
                          "max-w-[min(11rem,calc(100vw-7rem))] truncate rounded-full border border-border bg-surface/95 px-2.5 py-1",
                          "text-[11px] font-medium text-foreground/75 shadow-[0_6px_18px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl",
                          "opacity-0 transition-[opacity,color,border-color] duration-200",
                          "group-hover:opacity-100 group-hover:border-primary/20 group-hover:text-foreground/90",
                          "group-focus-visible:opacity-100",
                          open && "opacity-100"
                        )}
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
            "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border outline-none",
            "border-border bg-surface-elevated/95 text-foreground/80 backdrop-blur-xl",
            "shadow-[0_12px_36px_-12px_rgba(0,0,0,0.95)]",
            "transition-[transform,border-color,box-shadow,color] duration-200",
            "hover:scale-105 hover:border-primary/35 hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "motion-reduce:transition-none motion-reduce:hover:scale-100",
            open &&
              "border-primary/40 text-primary shadow-[0_12px_36px_-12px_rgba(0,0,0,0.95),0_0_32px_-12px_rgba(201,169,106,0.45)]"
          )}
        >
          {/* Anneaux lunaires au repos / ouvert */}
          <span
            className={cn(
              "pointer-events-none absolute inset-[5px] rounded-full border transition-colors duration-300",
              open ? "border-primary/25" : "border-foreground/8"
            )}
          />
          <span
            className={cn(
              "pointer-events-none absolute inset-[10px] rounded-full border transition-opacity duration-300",
              open ? "border-primary/12 opacity-100" : "opacity-0"
            )}
          />

          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={open ? "close" : "contact"}
              initial={
                reduceMotion ? false : { opacity: 0, rotate: -20, scale: 0.75 }
              }
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotate: 20, scale: 0.75 }
              }
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="relative flex"
            >
              {open ? (
                <X className="h-6 w-6" strokeWidth={1.7} aria-hidden />
              ) : (
                <Moon className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.5} aria-hidden />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

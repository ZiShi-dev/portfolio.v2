"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import type { LocalizedFaq } from "@/lib/faqs/store";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type FaqSectionProps = {
  faqs: LocalizedFaq[];
  /** Variante compacte (page offre) : pas de CTA final */
  compact?: boolean;
  headingId?: string;
};

/** FAQ commerciale publique — accordion accessible (pattern Engagements). */
export function FaqSection({
  faqs,
  compact = false,
  headingId = "faq-heading",
}: FaqSectionProps) {
  const t = useTranslations("faq");
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <section
      id={compact ? undefined : "faq"}
      aria-labelledby={headingId}
      className={cn(
        "relative overflow-hidden bg-background",
        compact
          ? "mt-12 scroll-mt-28"
          : "scroll-mt-28 px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
      )}
    >
      {!compact ? <CelestialAtlas intensity="subtle" /> : null}

      <div
        className={cn(
          "relative z-10",
          compact ? "mx-auto max-w-3xl" : "mx-auto max-w-3xl"
        )}
      >
        <div className={cn(!compact && "text-center")}>
          <Reveal>
            <span className="inline-block rounded-full border border-border-gold bg-surface-elevated/60 px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary sm:text-[11px]">
              {t("eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              id={headingId}
              className={cn(
                "mt-4 font-display font-semibold tracking-tight text-foreground",
                compact
                  ? "text-2xl sm:text-3xl"
                  : "text-3xl sm:mt-5 sm:text-4xl md:text-5xl"
              )}
            >
              {t("title")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h2>
          </Reveal>
          {!compact ? (
            <Reveal delay={0.1}>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                {t("subtitle")}
              </p>
            </Reveal>
          ) : null}
        </div>

        {!compact ? <CelestialDivider className="mt-10 sm:mt-12" /> : null}

        <Reveal delay={0.12}>
          <ul
            className={cn("space-y-0", compact ? "mt-6" : "mt-10 sm:mt-12")}
            role="list"
          >
            {faqs.map((item, index) => {
              const isOpen = openId === item.id;
              const panelId = `${baseId}-panel-${item.id}`;
              const buttonId = `${baseId}-btn-${item.id}`;

              return (
                <li key={item.id}>
                  <div
                    className={cn(
                      "border-b border-border/80 transition-colors",
                      isOpen && "border-border-gold/40"
                    )}
                  >
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenId((prev) =>
                          prev === item.id ? null : item.id
                        )
                      }
                      className="flex w-full min-h-14 items-start gap-3 py-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-4 sm:py-5"
                    >
                      <span
                        className={cn(
                          "mt-1 shrink-0 font-mono text-[10px] tracking-[0.18em]",
                          isOpen ? "text-primary" : "text-primary/55"
                        )}
                        aria-hidden
                      >
                        {item.reference ||
                          String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block font-display text-base font-semibold leading-snug sm:text-lg",
                            isOpen ? "text-primary" : "text-foreground"
                          )}
                        >
                          {item.question}
                        </span>
                      </span>

                      <ChevronDown
                        className={cn(
                          "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                          isOpen && "rotate-180 text-primary"
                        )}
                        aria-hidden
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={
                            reduceMotion
                              ? { opacity: 1, height: "auto" }
                              : { opacity: 0, height: 0 }
                          }
                          animate={{ opacity: 1, height: "auto" }}
                          exit={
                            reduceMotion
                              ? { opacity: 1, height: 0 }
                              : { opacity: 0, height: 0 }
                          }
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                          }
                          className="overflow-hidden"
                        >
                          <div className="pb-5 ps-[3.25rem] pe-2 sm:pb-6 sm:ps-16">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {!compact ? (
          <Reveal delay={0.18}>
            <div className="mt-12 border-t border-border/60 pt-10 text-center sm:mt-14">
              <p className="font-display text-lg font-semibold text-foreground sm:text-xl">
                {t("ctaTitle")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("ctaSubtitle")}
              </p>
              <Button asChild size="lg" className="mt-6 min-h-12">
                <Link href={routes.startProject}>{t("ctaPrimary")}</Link>
              </Button>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

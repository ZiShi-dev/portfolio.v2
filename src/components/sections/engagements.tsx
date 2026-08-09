"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { EngagementIcon } from "@/lib/engagements/icons";
import type { LocalizedEngagement } from "@/lib/engagements/store";
import { cn } from "@/lib/utils";

type EngagementsProps = {
  engagements: LocalizedEngagement[];
};

/** Section publique — engagements en Q/R (accordéon). */
export function Engagements({ engagements }: EngagementsProps) {
  const t = useTranslations("engagements");
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(
    engagements[0]?.id ?? null
  );

  if (engagements.length === 0) return null;

  return (
    <section
      id="engagements"
      aria-labelledby="engagements-heading"
      className="relative scroll-mt-28 overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
    >
      <CelestialAtlas intensity="subtle" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-block rounded-full border border-border-gold bg-surface-elevated/60 px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary sm:text-[11px]">
              {t("eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              id="engagements-heading"
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl"
            >
              {t("title")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        <CelestialDivider className="mt-10 sm:mt-12" />

        <Reveal delay={0.12}>
          <ul className="mt-10 space-y-3 sm:mt-12" role="list">
            {engagements.map((item) => {
              const isOpen = openId === item.id;
              const panelId = `${baseId}-panel-${item.id}`;
              const buttonId = `${baseId}-btn-${item.id}`;

              return (
                <li key={item.id}>
                  <div
                    className={cn(
                      "overflow-hidden rounded-xl border bg-surface-elevated/40 transition-colors",
                      isOpen
                        ? "border-border-gold/50"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenId((prev) => (prev === item.id ? null : item.id))
                      }
                      className="flex w-full min-h-14 items-start gap-3 px-4 py-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-4 sm:px-5 sm:py-5"
                    >
                      <div
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-primary"
                        aria-hidden
                      >
                        <EngagementIcon
                          name={item.icon}
                          className="h-4 w-4"
                        />
                      </div>

                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                          {item.reference}
                        </span>
                        <span className="mt-1.5 block font-display text-base font-semibold leading-snug text-foreground sm:text-lg">
                          {item.title}
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
                          <div className="border-t border-border px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
                            <p className="ps-12 text-sm leading-relaxed text-muted-foreground sm:ps-[3.25rem] sm:text-[0.95rem]">
                              {item.description}
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
      </div>
    </section>
  );
}

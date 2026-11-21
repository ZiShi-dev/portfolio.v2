"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeadingTitle } from "@/components/ui/heading-title";
import { Reveal } from "@/components/ui/reveal";
import { EngagementIcon } from "@/lib/engagements/icons";
import type { LocalizedEngagement } from "@/lib/engagements/store";
import { cn } from "@/lib/utils";

type EngagementsProps = {
  engagements: LocalizedEngagement[];
};

/** Section publique — engagements en Q/R (accordéon). */
export function Engagements({ engagements }: EngagementsProps) {
  const t = useTranslations("engagements");
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(
    engagements[0]?.id ?? null
  );

  if (engagements.length === 0) return null;

  return (
    <section
      id="engagements"
      aria-labelledby="engagements-heading"
      className="relative scroll-mt-28 overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="text-start">
          <Reveal delay={0.05} variant="left">
            <h2
              id="engagements-heading"
              className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl"
            >
              <HeadingTitle title={t("title")} highlight={t("titleHighlight")} />
            </h2>
          </Reveal>
          <Reveal delay={0.1} variant="right">
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12} variant="left">
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
                      className="pressable flex w-full min-h-14 items-start gap-3 px-4 py-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-4 sm:px-5 sm:py-5"
                    >
                      <EngagementIcon
                        name={item.icon}
                        className="mt-1 h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-xs tracking-[0.12em] text-primary/80">
                          {item.reference}
                        </span>
                        <span className="mt-1.5 block font-display text-base font-semibold leading-snug text-foreground sm:text-lg">
                          {item.title}
                        </span>
                      </span>

                      <ChevronDown
                        className={cn(
                          "mt-1 h-5 w-5 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out",
                          isOpen && "rotate-180 text-primary"
                        )}
                        aria-hidden
                      />
                    </button>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      hidden={!isOpen}
                    >
                      <div className="border-t border-border px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
                        <p className="ps-7 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                          {item.description}
                        </p>
                      </div>
                    </div>
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

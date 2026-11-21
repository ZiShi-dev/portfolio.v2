import { getTranslations } from "next-intl/server";
import { aboutStatsToDisplay, visibleAboutStats } from "@/data/about-stats";
import { getAboutStats } from "@/lib/about/store";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { HeadingTitle } from "@/components/ui/heading-title";
import { Reveal } from "@/components/ui/reveal";
import { ProcessStepper } from "@/components/ui/process-stepper";

export async function About() {
  const t = await getTranslations("about");
  const stats = visibleAboutStats(aboutStatsToDisplay(await getAboutStats()));

  return (
    <section
      id="a-propos"
      aria-labelledby="about-heading"
      className="relative scroll-mt-28 bg-background px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-start">
          <Reveal delay={0.05} variant="left">
            <h2
              id="about-heading"
              className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl"
            >
              <HeadingTitle title={t("title")} highlight={t("titleHighlight")} />
            </h2>
          </Reveal>
          <Reveal delay={0.1} variant="right">
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              {t("p1")}
            </p>
          </Reveal>
          <Reveal delay={0.12} variant="left">
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
              {t("p2")}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} variant="right">
          <div className="mx-auto mt-10 max-w-2xl sm:mt-12">
            <ProcessStepper />
          </div>
        </Reveal>

        {stats.length > 0 ? (
        <Reveal delay={0.2}>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.id}
                className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated px-4 py-5 text-start"
              >
                <div className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
                  <AnimatedNumber
                    value={s.value}
                    decimals={s.decimals}
                    suffix={s.suffix ?? ""}
                  />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {t(`stats.${s.id}`)}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        ) : null}
      </div>
    </section>
  );
}

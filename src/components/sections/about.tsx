import { getTranslations } from "next-intl/server";
import { aboutStatsToDisplay, visibleAboutStats } from "@/data/about-stats";
import { getAboutStats } from "@/lib/about/store";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Reveal } from "@/components/ui/reveal";
import { ProcessStepper } from "@/components/ui/process-stepper";

export async function About() {
  const t = await getTranslations("about");
  const stats = visibleAboutStats(aboutStatsToDisplay(await getAboutStats()));

  return (
    <section
      id="a-propos"
      aria-labelledby="about-heading"
      className="relative scroll-mt-28 bg-background px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-block rounded-full border border-border-gold bg-background/70 px-4 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-primary sm:text-[11px]">
              {t("eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              id="about-heading"
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-4xl md:text-5xl"
            >
              {t("title")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              {t("p1")}
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
              {t("p2")}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-2xl sm:mt-16 lg:mt-20">
            <ProcessStepper />
          </div>
        </Reveal>

        {stats.length > 0 ? (
        <Reveal delay={0.2}>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:mt-16 sm:gap-4 lg:mt-20">
            {stats.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-step-accent/20 bg-background/70 p-4 text-center backdrop-blur-sm transition-colors hover:border-step-accent/40 sm:p-6"
              >
                <div className="font-display text-3xl font-semibold text-primary sm:text-4xl">
                  <AnimatedNumber
                    value={s.value}
                    decimals={s.decimals}
                    suffix={s.suffix ?? ""}
                  />
                </div>
                <div className="mt-2 text-sm text-foreground/60">
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

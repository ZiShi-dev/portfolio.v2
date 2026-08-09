"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { ProjectTypeBadges } from "@/components/sections/project-type-badges";
import { ReviewCard } from "@/components/sections/review-card";
import { Link } from "@/i18n/navigation";
import type { ReviewItem } from "@/data/reviews";
import { isSafeHttpUrl } from "@/lib/review-schema";
import { routes } from "@/lib/routes";
import type { LocalizedProjectItem } from "@/data/projects";

type CaseStudyDetailProps = {
  project: LocalizedProjectItem;
  nextSlug?: string | null;
  reviews?: ReviewItem[];
};

export function CaseStudyDetail({
  project,
  nextSlug,
  reviews = [],
}: CaseStudyDetailProps) {
  const t = useTranslations("caseStudy");
  const tReviews = useTranslations("reviews");
  const cover = project.images[0]?.src;
  const gallery = project.images.slice(1);
  const features = project.features ?? [];
  const technologies = project.technologies?.length
    ? project.technologies
    : project.tags;

  return (
    <article className="relative overflow-hidden bg-background px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 celestial-vault opacity-40" aria-hidden />

      <div className="relative z-10 mx-auto max-w-4xl">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary sm:text-[11px]">
            {project.reference ?? "VZ—CASE"}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {project.desc}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {project.category}
            </span>
            <ProjectTypeBadges
              businessTypeIds={project.businessTypeIds}
              tags={[]}
            />
          </div>
        </Reveal>

        {cover ? (
          <Reveal delay={0.08}>
            <figure className="mt-10 overflow-hidden rounded-xl border border-border-gold bg-surface-elevated sm:mt-12">
              <Image
                src={cover}
                alt={project.title}
                width={1200}
                height={720}
                priority
                className="h-auto w-full object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </figure>
          </Reveal>
        ) : null}

        <CelestialDivider className="mt-12 sm:mt-16" />

        {project.clientNeed ? (
          <SectionBlock title={t("need")} body={project.clientNeed} />
        ) : null}
        {project.objective ? (
          <SectionBlock title={t("objective")} body={project.objective} />
        ) : null}
        {project.solution ? (
          <SectionBlock title={t("solution")} body={project.solution} />
        ) : null}

        {features.length > 0 ? (
          <Reveal delay={0.05}>
            <section className="mt-12 sm:mt-14">
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {t("features")}
              </h2>
              <ul className="mt-5 space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ) : null}

        {project.result ? (
          <SectionBlock title={t("result")} body={project.result} />
        ) : null}

        {gallery.length > 0 ? (
          <Reveal delay={0.05}>
            <section className="mt-12 sm:mt-14">
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {t("gallery")}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {gallery.map((img) => (
                  <figure
                    key={img.src}
                    className="overflow-hidden rounded-xl border border-border bg-surface-elevated"
                  >
                    <Image
                      src={img.src}
                      alt={img.label || project.title}
                      width={800}
                      height={500}
                      loading="lazy"
                      className="h-auto w-full object-cover"
                      sizes="(max-width: 640px) 100vw, 448px"
                    />
                    {img.label ? (
                      <figcaption className="border-t border-border px-3 py-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                        {img.label}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {technologies.length > 0 ? (
          <Reveal delay={0.05}>
            <section className="mt-12 sm:mt-14">
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {t("technologies")}
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-md border border-border-gold bg-surface px-3 py-1.5 font-mono text-[11px] tracking-wide text-primary/90"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ) : null}

        {reviews.length > 0 ? (
          <Reveal delay={0.06}>
            <section className="mt-12 sm:mt-14" aria-labelledby="case-review-heading">
              <h2
                id="case-review-heading"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {t("clientReview")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {tReviews("verifiedNote")}
              </p>
              <div
                className={`mt-6 grid gap-4 ${
                  reviews.length === 1
                    ? "max-w-xl grid-cols-1"
                    : "sm:grid-cols-2"
                }`}
              >
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {project.link && isSafeHttpUrl(project.link) ? (
          <Reveal delay={0.05}>
            <p className="mt-10">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-primary transition-colors hover:text-primary-hover"
              >
                {t("visitSite")}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </p>
          </Reveal>
        ) : null}

        {project.appLink && isSafeHttpUrl(project.appLink) ? (
          <Reveal delay={0.06}>
            <p className={project.link ? "mt-3" : "mt-10"}>
              <a
                href={project.appLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-primary transition-colors hover:text-primary-hover"
              >
                {t("visitApp")}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </p>
          </Reveal>
        ) : null}

        <CelestialDivider className="mt-14 sm:mt-16" />

        <Reveal delay={0.08}>
          <section className="mt-10 rounded-xl border border-border-gold bg-surface-elevated/90 p-6 text-center sm:p-10">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              {t("ctaSubtitle")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
                <Link href={routes.startProject}>{t("ctaPrimary")}</Link>
              </Button>
              {nextSlug ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-h-12 w-full sm:w-auto"
                >
                  <Link href={`${routes.projects}/${nextSlug}`}>
                    {t("ctaNext")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-h-12 w-full sm:w-auto"
                >
                  <Link href={routes.projects}>{t("backToList")}</Link>
                </Button>
              )}
            </div>
          </section>
        </Reveal>
      </div>
    </article>
  );
}

function SectionBlock({ title, body }: { title: string; body: string }) {
  return (
    <Reveal delay={0.05}>
      <section className="mt-12 sm:mt-14">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground sm:text-lg">
          {body}
        </p>
      </section>
    </Reveal>
  );
}

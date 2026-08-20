"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { ProjectTypeBadges } from "@/components/sections/project-type-badges";
import { ProjectStatusBadge } from "@/components/sections/project-status-badge";
import { ProjectLiveImageLink } from "@/components/sections/project-live-image-link";
import { ReviewCard } from "@/components/sections/review-card";
import { Link } from "@/i18n/navigation";
import type { ReviewItem } from "@/data/reviews";
import { isSafeHttpUrl } from "@/lib/review-schema";
import { routes } from "@/lib/routes";
import type { LocalizedProjectItem } from "@/data/projects";
import {
  ProjectTechnologies,
  RelatedServiceLinks,
  type RelatedServiceLink,
} from "@/components/sections/project-related-extras";

type CaseStudyDetailProps = {
  project: LocalizedProjectItem;
  nextSlug?: string | null;
  reviews?: ReviewItem[];
  relatedServices?: RelatedServiceLink[];
};

export function CaseStudyDetail({
  project,
  nextSlug,
  reviews = [],
  relatedServices = [],
}: CaseStudyDetailProps) {
  const t = useTranslations("caseStudy");
  const tReviews = useTranslations("reviews");
  const cover = project.images[0]?.src;
  const gallery = project.images.slice(1);
  const liveUrl =
    project.link && isSafeHttpUrl(project.link) ? project.link : null;
  const features = project.features ?? [];
  const technologies = project.technologies ?? [];
  const businessTypeIds = Array.from(
    new Set(project.businessTypeIds ?? [])
  );

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
          {businessTypeIds.length > 0 ? (
            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/75">
                {t("applicationType")}
              </p>
              <ProjectTypeBadges
                businessTypeIds={businessTypeIds}
                className="mt-3"
              />
            </div>
          ) : null}
          <ProjectTechnologies
            items={technologies}
            title={t("technologies")}
          />
        </Reveal>

        {cover ? (
          <Reveal delay={0.08}>
            <figure className="relative mt-10 overflow-hidden rounded-xl border border-border-gold bg-surface-elevated sm:mt-12">
              <ProjectLiveImageLink href={liveUrl} label={t("visitSite")}>
                <Image
                  src={cover}
                  alt={project.title}
                  width={1200}
                  height={720}
                  priority
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </ProjectLiveImageLink>
              <div className="pointer-events-none absolute start-3 top-3 sm:start-4 sm:top-4">
                <ProjectStatusBadge
                  categoryKey={project.categoryKey}
                  priceLabel={project.listingPriceLabel}
                />
              </div>
            </figure>
          </Reveal>
        ) : null}

        <ProjectListingDetails project={project} />

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
                    <ProjectLiveImageLink href={liveUrl} label={t("visitSite")}>
                      <Image
                        src={img.src}
                        alt={img.label || project.title}
                        width={800}
                        height={500}
                        loading="lazy"
                        className="h-auto w-full object-cover"
                        sizes="(max-width: 640px) 100vw, 448px"
                      />
                    </ProjectLiveImageLink>
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

        <RelatedServiceLinks
          services={relatedServices}
          title={t("relatedOffers")}
        />

        {project.categoryKey !== "personal" ? (
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
        ) : (
          nextSlug ? (
            <Reveal delay={0.08}>
              <p className="mt-10 text-center">
                <Link
                  href={`${routes.projects}/${nextSlug}`}
                  className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("ctaNext")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </p>
            </Reveal>
          ) : (
            <Reveal delay={0.08}>
              <p className="mt-10 text-center">
                <Link
                  href={routes.projects}
                  className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("backToList")}
                </Link>
              </p>
            </Reveal>
          )
        )}
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

function ProjectListingDetails({ project }: { project: LocalizedProjectItem }) {
  const t = useTranslations("caseStudy");

  if (project.categoryKey === "personal") return null;

  if (project.categoryKey === "for_sale") {
    return (
      <Reveal delay={0.05}>
        <section className="mt-10 rounded-xl border border-border-gold/40 bg-surface-elevated/60 p-5 sm:mt-12 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/75">
            {t("forSaleEyebrow")}
          </p>
          {project.listingPriceLabel ? (
            <p className="mt-3 font-mono text-xl tracking-wide text-primary sm:text-2xl">
              {project.listingPriceLabel}
            </p>
          ) : null}
          {project.listingIntent ? (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
                {t("listingIntent")}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {project.listingIntent}
              </p>
            </div>
          ) : null}
        </section>
      </Reveal>
    );
  }

  return (
    <Reveal delay={0.05}>
      <section className="mt-10 rounded-xl border border-border-gold/40 bg-surface-elevated/60 p-5 sm:mt-12 sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/75">
          {t("soldEyebrow")}
        </p>
        {project.listingPriceLabel ? (
          <p className="mt-3 font-mono text-xl tracking-wide text-primary sm:text-2xl">
            {t("soldPrice", { price: project.listingPriceLabel })}
          </p>
        ) : null}
        {project.listingIntent ? (
          <div className="mt-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
              {t("soldWork")}
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {project.listingIntent}
            </p>
          </div>
        ) : null}
      </section>
    </Reveal>
  );
}

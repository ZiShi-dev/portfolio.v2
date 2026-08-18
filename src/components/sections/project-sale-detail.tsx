"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, ExternalLink, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { GlowCard } from "@/components/ui/glow-card";
import { ProjectTypeBadges } from "@/components/sections/project-type-badges";
import { ProjectStatusBadge } from "@/components/sections/project-status-badge";
import { ReviewCard } from "@/components/sections/review-card";
import { Link } from "@/i18n/navigation";
import type { ReviewItem } from "@/data/reviews";
import type { FooterSocialLink } from "@/lib/brand";
import { isSafeHttpUrl } from "@/lib/review-schema";
import { resolveSaleCtaButtons } from "@/lib/projects/sale-cta";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { LocalizedProjectItem } from "@/data/projects";

export type ProjectSaleContacts = {
  email: string;
  socials: FooterSocialLink[];
};

type ProjectSaleDetailProps = {
  project: LocalizedProjectItem;
  nextSlug?: string | null;
  reviews?: ReviewItem[];
  contacts: ProjectSaleContacts;
};

const PROCESS_STEPS = ["interest", "customize", "launch", "sell"] as const;
const FAQ_KEYS = [
  "ready",
  "customize",
  "included",
  "hosting",
  "after",
  "demo",
] as const;

function SaleCtaButtons({
  project,
  contacts,
}: {
  project: LocalizedProjectItem;
  contacts: ProjectSaleContacts;
}) {
  const t = useTranslations("projectSale");
  const buttons = resolveSaleCtaButtons({
    channels: project.saleCtaChannels ?? [],
    customLabel: project.saleCtaLabel,
    email: contacts.email,
    socials: contacts.socials,
    emailLabel: t("ctaEmail"),
  });

  if (buttons.length === 0) return null;

  return (
    <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {buttons.map((button) => {
        const external = button.href.startsWith("http");
        return (
          <Button
            key={button.id}
            asChild
            size="lg"
            variant={button.primary ? "default" : "outline"}
            className="min-h-12 w-full sm:w-auto"
          >
            <a
              href={button.href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {button.id === "email" ? (
                <Mail className="h-4 w-4" aria-hidden />
              ) : (
                <MessageCircle className="h-4 w-4" aria-hidden />
              )}
              {button.label}
            </a>
          </Button>
        );
      })}
    </div>
  );
}

export function ProjectSaleDetail({
  project,
  nextSlug,
  reviews = [],
  contacts,
}: ProjectSaleDetailProps) {
  const t = useTranslations("projectSale");
  const tCase = useTranslations("caseStudy");
  const tReviews = useTranslations("reviews");
  const cover = project.images[0]?.src;
  const gallery = project.images.slice(1);
  const features = project.features ?? [];
  const businessTypeIds = Array.from(new Set(project.businessTypeIds ?? []));
  const demoUrl =
    project.link && isSafeHttpUrl(project.link) ? project.link : null;
  const isEcommerce = businessTypeIds.includes("ecommerce");
  const faqBaseId = useId();
  const [openFaq, setOpenFaq] = useState<string>(FAQ_KEYS[0]);

  return (
    <article className="relative overflow-hidden bg-background px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 celestial-vault opacity-40" aria-hidden />

      <div className="relative z-10 mx-auto max-w-4xl">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary sm:text-[11px]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {project.title}
            <span className="mt-2 block text-xl font-medium text-primary sm:text-2xl md:text-3xl">
              {isEcommerce ? t("heroKickerShop") : t("heroKicker")}
            </span>
          </h1>
          {project.listingPriceLabel ? (
            <p className="mt-5 font-mono text-3xl tracking-wide text-primary sm:text-4xl">
              {project.listingPriceLabel}
            </p>
          ) : null}
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {project.desc}
          </p>
          {businessTypeIds.length > 0 ? (
            <div className="mt-6">
              <ProjectTypeBadges businessTypeIds={businessTypeIds} className="mt-0" />
            </div>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SaleCtaButtons project={project} contacts={contacts} />
            {demoUrl ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-12 w-full sm:w-auto"
              >
                <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                  {t("ctaDemo")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            ) : null}
          </div>
        </Reveal>

        {cover ? (
          <Reveal delay={0.08}>
            <figure className="relative mt-10 overflow-hidden rounded-xl border border-border-gold bg-surface-elevated sm:mt-12">
              <Image
                src={cover}
                alt={project.title}
                width={1200}
                height={720}
                priority
                className="h-auto w-full object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
              <div className="absolute start-3 top-3 sm:start-4 sm:top-4">
                <ProjectStatusBadge
                  categoryKey={project.categoryKey}
                  priceLabel={project.listingPriceLabel}
                />
              </div>
            </figure>
          </Reveal>
        ) : null}

        {project.clientNeed || project.solution || project.result ? (
          <Reveal delay={0.05}>
            <section className="mt-12 sm:mt-14" aria-labelledby="sale-value-heading">
              <h2
                id="sale-value-heading"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {t("valueTitle")}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {project.clientNeed ? (
                  <GlowCard>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
                      {t("forWhom")}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {project.clientNeed}
                    </p>
                  </GlowCard>
                ) : null}
                {project.solution ? (
                  <GlowCard>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
                      {t("whatYouGet")}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {project.solution}
                    </p>
                  </GlowCard>
                ) : null}
                {project.result ? (
                  <GlowCard className="sm:col-span-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
                      {t("insteadOfZero")}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {project.result}
                    </p>
                  </GlowCard>
                ) : null}
              </div>
            </section>
          </Reveal>
        ) : null}

        {features.length > 0 || project.listingIntent ? (
          <Reveal delay={0.05}>
            <section className="mt-12 sm:mt-16" aria-labelledby="sale-included-heading">
              <h2
                id="sale-included-heading"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {t("includedTitle", {
                  price: project.listingPriceLabel ?? "",
                })}
              </h2>
              {features.length > 0 ? (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 rounded-xl border border-border bg-surface-elevated/80 px-4 py-3 text-sm leading-relaxed text-foreground/80"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {project.listingIntent ? (
                <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {project.listingIntent}
                </p>
              ) : null}
            </section>
          </Reveal>
        ) : null}

        <Reveal delay={0.05}>
          <section className="mt-12 sm:mt-16" aria-labelledby="sale-process-heading">
            <h2
              id="sale-process-heading"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {t("processTitle")}
            </h2>
            <ol className="relative mt-8 space-y-8">
              <span
                className="absolute bottom-3 start-[1.125rem] top-3 w-px bg-primary/25"
                aria-hidden
              />
              {PROCESS_STEPS.map((key, index) => (
                <li key={key} className="relative ps-12">
                  <span
                    className="absolute start-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-primary/50 bg-surface-elevated font-mono text-sm text-foreground"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {t(`process.${key}.title`)}
                  </h3>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {t(`process.${key}.desc`)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="mt-12 sm:mt-16" aria-labelledby="sale-costs-heading">
            <h2
              id="sale-costs-heading"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {t("costsTitle")}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <GlowCard>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
                  {t("costsIncludedLabel")}
                </p>
                <p className="mt-3 font-mono text-2xl text-primary">
                  {project.listingPriceLabel}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("costsIncluded")}
                </p>
              </GlowCard>
              <GlowCard>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
                  {t("costsThirdLabel")}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("costsThird")}
                </p>
              </GlowCard>
            </div>
          </section>
        </Reveal>

        {gallery.length > 0 ? (
          <Reveal delay={0.05}>
            <section className="mt-12 sm:mt-16" aria-labelledby="sale-gallery-heading">
              <h2
                id="sale-gallery-heading"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {t("proofTitle")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {t("proofSubtitle")}
              </p>
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
              {demoUrl ? (
                <p className="mt-6">
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-primary transition-colors hover:text-primary-hover"
                  >
                    {tCase("visitSite")}
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </p>
              ) : null}
            </section>
          </Reveal>
        ) : demoUrl ? (
          <Reveal delay={0.05}>
            <p className="mt-10">
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-primary transition-colors hover:text-primary-hover"
              >
                {tCase("visitSite")}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </p>
          </Reveal>
        ) : null}

        {reviews.length > 0 ? (
          <Reveal delay={0.06}>
            <section className="mt-12 sm:mt-14" aria-labelledby="sale-review-heading">
              <h2
                id="sale-review-heading"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {tCase("clientReview")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {tReviews("verifiedNote")}
              </p>
              <div
                className={`mt-6 grid gap-4 ${
                  reviews.length === 1 ? "max-w-xl grid-cols-1" : "sm:grid-cols-2"
                }`}
              >
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        <Reveal delay={0.05}>
          <section className="mt-12 sm:mt-16" aria-labelledby="sale-faq-heading">
            <h2
              id="sale-faq-heading"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {t("faqTitle")}
            </h2>
            <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface-elevated/70">
              {FAQ_KEYS.map((key) => {
                const panelId = `${faqBaseId}-${key}`;
                const open = openFaq === key;
                return (
                  <div key={key}>
                    <h3>
                      <button
                        type="button"
                        id={`${panelId}-btn`}
                        aria-expanded={open}
                        aria-controls={panelId}
                        className="flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-start text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-5 sm:text-base"
                        onClick={() => setOpenFaq(open ? "" : key)}
                      >
                        {t(`faq.${key}.q`)}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-primary transition-transform",
                            open && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                    </h3>
                    {open ? (
                      <p
                        id={panelId}
                        role="region"
                        aria-labelledby={`${panelId}-btn`}
                        className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5"
                      >
                        {t(`faq.${key}.a`)}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>

        <CelestialDivider className="mt-14 sm:mt-16" />

        <Reveal delay={0.08}>
          <section className="mt-10 rounded-xl border border-border-gold bg-surface-elevated/90 p-6 text-center sm:p-10">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("finalTitle", { title: project.title })}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              {t("finalSubtitle")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3">
              <SaleCtaButtons project={project} contacts={contacts} />
              <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
                {demoUrl ? (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-h-12 w-full sm:w-auto"
                  >
                    <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                      {t("ctaDemo")}
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </a>
                  </Button>
                ) : null}
                {nextSlug ? (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-h-12 w-full sm:w-auto"
                  >
                    <Link href={`${routes.projects}/${nextSlug}`}>
                      {tCase("ctaNext")}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-h-12 w-full sm:w-auto"
                  >
                    <Link href={routes.projects}>{tCase("backToList")}</Link>
                  </Button>
                )}
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </article>
  );
}

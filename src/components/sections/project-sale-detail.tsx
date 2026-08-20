"use client";

import { useId, useState, type ComponentType } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, ExternalLink } from "lucide-react";
import {
  SiDiscord,
  SiInstagram,
  SiTiktok,
  SiWhatsapp,
} from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CelestialDivider } from "@/components/ui/celestial-divider";
import { GlowCard } from "@/components/ui/glow-card";
import { ProjectTypeBadges } from "@/components/sections/project-type-badges";
import { ProjectStatusBadge } from "@/components/sections/project-status-badge";
import { ProjectLiveImageLink } from "@/components/sections/project-live-image-link";
import { ReviewCard } from "@/components/sections/review-card";
import { Link } from "@/i18n/navigation";
import type { ReviewItem } from "@/data/reviews";
import type { FooterSocialLink } from "@/lib/brand";
import { isSafeHttpUrl } from "@/lib/review-schema";
import {
  resolveSaleCtaButtons,
  type SaleCtaButton,
} from "@/lib/projects/sale-cta";
import type { SaleCtaChannel } from "@/lib/projects/schema";
import { routes, startProjectUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { LocalizedProjectItem } from "@/data/projects";
import {
  ProjectTechnologies,
  RelatedServiceLinks,
  type RelatedServiceLink,
} from "@/components/sections/project-related-extras";

export type ProjectSaleContacts = {
  /** Réseaux déjà triés par la priorité de contact réglée en admin. */
  socials: FooterSocialLink[];
};

type ProjectSaleDetailProps = {
  project: LocalizedProjectItem;
  nextSlug?: string | null;
  reviews?: ReviewItem[];
  relatedServices?: RelatedServiceLink[];
  contacts: ProjectSaleContacts;
};

const PROCESS_STEPS = ["interest", "customize", "launch", "sell"] as const;
/** Seules les questions dont la réponse n’est pas déjà ailleurs sur la page. */
const FAQ_KEYS = ["ready", "included", "catalog", "after"] as const;
/** Aperçus visibles avant dépliement de la galerie. */
const GALLERY_PREVIEW_COUNT = 4;

function listingIntentParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const CHANNEL_ICONS: Record<
  SaleCtaChannel,
  ComponentType<{ className?: string }>
> = {
  whatsapp: SiWhatsapp,
  discord: SiDiscord,
  instagram: SiInstagram,
  tiktok: SiTiktok,
};

/**
 * Périmètre détaillé (conditions, délais, ce qui reste à la charge du client) :
 * replié par défaut pour ne pas allonger la page, mais toujours dans le DOM.
 */
function ScopeDisclosure({
  label,
  paragraphs,
}: {
  label: string;
  paragraphs: string[];
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border-gold/40 bg-surface-elevated/50">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-start text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-5"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-primary transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <ul
        id={panelId}
        hidden={!open}
        className="space-y-2.5 px-4 pb-4 sm:px-5"
      >
        {paragraphs.map((paragraph) => (
          <li
            key={paragraph}
            className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{paragraph}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SaleContactPanel({
  project,
  contacts,
  compact = false,
  plain = false,
}: {
  project: LocalizedProjectItem;
  contacts: ProjectSaleContacts;
  compact?: boolean;
  plain?: boolean;
}) {
  const t = useTranslations("projectSale");
  const buttons = resolveSaleCtaButtons({
    channels: project.saleCtaChannels ?? [],
    socials: contacts.socials,
  });

  if (project.categoryKey === "personal" || buttons.length === 0) return null;

  const heading = t("contactWays");

  return (
    <div
      className={cn(
        "w-full text-start",
        !plain &&
          "rounded-xl border border-border-gold bg-surface-elevated/80",
        !plain && (compact ? "p-4 sm:p-5" : "p-5 sm:p-6")
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
        VZ—CONTACT
      </p>
      <p className="mt-2 font-display text-lg font-semibold text-foreground sm:text-xl">
        {heading}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("contactWaysHint")}
      </p>
      <ul
        className={cn(
          "mt-4 grid gap-2.5",
          buttons.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        )}
      >
        {buttons.map((button) => {
          const Icon = CHANNEL_ICONS[button.id];
          const external = button.href.startsWith("http");
          return (
            <li key={button.id}>
              <a
                href={button.href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={cn(
                  "group flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated",
                  button.primary
                    ? "border-primary/40 bg-primary/10 text-foreground hover:border-primary/60 hover:bg-primary/14"
                    : "border-border bg-background/40 text-foreground/90 hover:border-primary/40 hover:bg-surface-high hover:text-primary"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
                    button.primary
                      ? "border-primary/30 bg-background/50 text-primary"
                      : "border-border bg-background/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {button.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SalePrimaryCta({
  button,
  label,
  className,
  variant = "default",
}: {
  button: SaleCtaButton;
  label: string;
  className?: string;
  variant?: "default" | "outline";
}) {
  const Icon = CHANNEL_ICONS[button.id];
  const external = button.href.startsWith("http");
  return (
    <Button
      asChild
      size="lg"
      variant={variant}
      className={cn("min-h-12 w-full sm:w-auto", className)}
    >
      <a
        href={button.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </a>
    </Button>
  );
}

export function ProjectSaleDetail({
  project,
  nextSlug,
  reviews = [],
  relatedServices = [],
  contacts,
}: ProjectSaleDetailProps) {
  const t = useTranslations("projectSale");
  const tCase = useTranslations("caseStudy");
  const tReviews = useTranslations("reviews");
  const cover = project.images[0]?.src;
  const gallery = project.images.slice(1);
  const features = project.features ?? [];
  const technologies = project.technologies ?? [];
  const intentParagraphs = listingIntentParagraphs(project.listingIntent ?? "");
  const businessTypeIds = Array.from(new Set(project.businessTypeIds ?? []));
  const demoUrl =
    project.link && isSafeHttpUrl(project.link) ? project.link : null;
  const isEcommerce = businessTypeIds.includes("ecommerce");
  const faqBaseId = useId();
  const [openFaq, setOpenFaq] = useState<string>(FAQ_KEYS[0]);
  const [showAllImages, setShowAllImages] = useState(false);
  const hiddenImages = Math.max(0, gallery.length - GALLERY_PREVIEW_COUNT);
  const contactButtons = resolveSaleCtaButtons({
    channels: project.saleCtaChannels ?? [],
    socials: contacts.socials,
  });
  const primaryContact = contactButtons[0] ?? null;
  const primaryLabel = primaryContact?.label || "";
  const similarProjectLabel = t("ctaSimilarProject");
  const similarProjectHref = startProjectUrl({
    projectType: "ecommerce",
    intent: "start",
  });
  const showSaleContact = project.categoryKey !== "personal";
  return (
    <article className="relative overflow-hidden bg-background px-4 pb-28 pt-28 sm:px-6 sm:pb-28 sm:pt-32">
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
          <ProjectTechnologies
            items={technologies}
            title={tCase("technologies")}
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
            {showSaleContact && primaryContact ? (
              <SalePrimaryCta
                button={primaryContact}
                label={primaryLabel}
                className="sm:w-auto"
                variant="outline"
              />
            ) : null}
          </div>
          {showSaleContact && contactButtons.length > 1 ? (
            <p className="mt-3">
              <a
                href="#sale-contact"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {t("otherWays")}
              </a>
            </p>
          ) : null}
        </Reveal>

        {cover ? (
          <Reveal delay={0.08}>
            <figure className="relative mt-8 overflow-hidden rounded-xl border border-border-gold bg-surface-elevated sm:mt-10">
              <ProjectLiveImageLink href={demoUrl} label={t("ctaDemo")}>
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

        <Reveal delay={0.05}>
          <section className="mt-12 sm:mt-14" aria-labelledby="sale-included-heading">
            <h2
              id="sale-included-heading"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {t("includedTitle", {
                price: project.listingPriceLabel ?? "",
              })}
            </h2>
            {features.length > 0 ? (
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
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
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            {intentParagraphs.length > 0 ? (
              <ScopeDisclosure
                label={t("scopeDetails")}
                paragraphs={intentParagraphs}
              />
            ) : null}
          </section>
        </Reveal>

        {project.objective ? (
          <Reveal delay={0.05}>
            <section className="mt-12 sm:mt-14" aria-labelledby="sale-start-heading">
              <h2
                id="sale-start-heading"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {t("gettingStartedTitle")}
              </h2>
              <GlowCard className="mt-6">
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {project.objective}
                </p>
              </GlowCard>
            </section>
          </Reveal>
        ) : null}

        <Reveal delay={0.05}>
          <section className="mt-12 sm:mt-14" aria-labelledby="sale-process-heading">
            <h2
              id="sale-process-heading"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {t("processTitle")}
            </h2>
            <ol className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7">
              {PROCESS_STEPS.map((key, index) => (
                <li key={key} className="relative ps-12">
                  <span
                    className="absolute start-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-primary/50 bg-surface-elevated font-mono text-sm text-foreground"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                    {t(`process.${key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t(`process.${key}.desc`)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        {gallery.length > 0 ? (
          <Reveal delay={0.05}>
            <section className="mt-12 sm:mt-14" aria-labelledby="sale-gallery-heading">
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
                {gallery.map((img, index) => (
                  <figure
                    key={img.src}
                    hidden={!showAllImages && index >= GALLERY_PREVIEW_COUNT}
                    className="overflow-hidden rounded-xl border border-border bg-surface-elevated"
                  >
                    <ProjectLiveImageLink href={demoUrl} label={t("ctaDemo")}>
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
              {hiddenImages > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowAllImages((open) => !open)}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm text-foreground/80 outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {showAllImages
                    ? t("galleryLess")
                    : t("galleryMore", { count: hiddenImages })}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-primary transition-transform",
                      showAllImages && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
              ) : null}
            </section>
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

        <RelatedServiceLinks
          services={relatedServices}
          title={tCase("relatedOffers")}
        />

        {showSaleContact ? (
        <Reveal delay={0.08}>
          <section
            id="sale-contact"
            className="mt-10 scroll-mt-28 rounded-xl border border-border-gold bg-surface-elevated/90 p-6 text-center sm:p-10"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("finalTitle", { title: project.title })}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              {t("finalSubtitle")}
            </p>
            <div className="mt-8">
              <SaleContactPanel project={project} contacts={contacts} plain />
              <p className="mt-6">
                <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
                  <Link href={similarProjectHref}>{similarProjectLabel}</Link>
                </Button>
              </p>
            </div>
            {nextSlug ? (
              <p className="mt-8">
                <Link
                  href={`${routes.projects}/${nextSlug}`}
                  className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
                >
                  {tCase("ctaNext")}
                </Link>
              </p>
            ) : (
              <p className="mt-8">
                <Link
                  href={routes.projects}
                  className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
                >
                  {tCase("backToList")}
                </Link>
              </p>
            )}
          </section>
        </Reveal>
        ) : nextSlug ? (
          <Reveal delay={0.08}>
            <p className="mt-10 text-center">
              <Link
                href={`${routes.projects}/${nextSlug}`}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              >
                {tCase("ctaNext")}
              </Link>
            </p>
          </Reveal>
        ) : (
          <Reveal delay={0.08}>
            <p className="mt-8 text-center">
              <Link
                href={routes.projects}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              >
                {tCase("backToList")}
              </Link>
            </p>
          </Reveal>
        )}
      </div>
    </article>
  );
}

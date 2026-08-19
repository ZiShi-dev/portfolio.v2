import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageBackBar } from "@/components/page-back-link";
import { brand } from "@/lib/brand";
import { createPageMetadata, routes } from "@/lib/routes";
import { getPublicContactEmail } from "@/lib/social/store";
import { getLegalConfig } from "@/lib/legal-config";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const linkClass = "text-primary hover:underline";
const sectionClass =
  "rounded-2xl border border-border/60 bg-card/35 p-5 shadow-sm sm:p-6";

function LegalDetail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="font-medium text-foreground/60">{label}</dt>
      <dd className="min-w-0 break-words text-foreground/85">{children}</dd>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalPage" });

  return createPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription", { brand: brand.name }),
    path: routes.legal,
    locale: locale as Locale,
  });
}

export default async function MentionsLegalesPage() {
  const t = await getTranslations("legalPage");
  const tCommon = await getTranslations("common");
  const contactEmail = await getPublicContactEmail();
  const legal = getLegalConfig();

  const externalLink = (href: string) =>
    function ExternalLink(chunks: ReactNode) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {chunks}
        </a>
      );
    };

  return (
    <>
      <PageBackBar href={routes.home} label={tCommon("backHome")} />
      <div className="px-4 pb-20 sm:px-6 sm:pb-24">
        <article className="mx-auto mt-8 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65 sm:text-base">
            {t("intro", { brand: brand.name })}
          </p>
          <p className="mt-2 text-xs text-foreground/50">{t("lastUpdated")}</p>

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-foreground/70 sm:text-base">
            <section className={sectionClass}>
              <h2 className="text-lg font-semibold text-foreground">
                {t("publisher")}
              </h2>
              <p className="mt-2">{t("publisherRole")}</p>
              <dl className="mt-4 space-y-3">
                <LegalDetail label={t("publisherNameLabel")}>
                  {legal.publisherName}
                </LegalDetail>
                {legal.legalForm ? (
                  <LegalDetail label={t("legalFormLabel")}>
                    {legal.legalForm}
                  </LegalDetail>
                ) : null}
                {legal.address ? (
                  <LegalDetail label={t("addressLabel")}>
                    {legal.address}
                  </LegalDetail>
                ) : null}
                {legal.registration ? (
                  <LegalDetail label={t("registrationLabel")}>
                    {legal.registration}
                  </LegalDetail>
                ) : null}
                {legal.vatNumber ? (
                  <LegalDetail label={t("vatLabel")}>
                    {legal.vatNumber}
                  </LegalDetail>
                ) : null}
                {legal.shareCapital ? (
                  <LegalDetail label={t("shareCapitalLabel")}>
                    {legal.shareCapital}
                  </LegalDetail>
                ) : null}
                {legal.phone ? (
                  <LegalDetail label={t("phoneLabel")}>
                    {legal.phone}
                  </LegalDetail>
                ) : null}
                {legal.publicationDirector ? (
                  <LegalDetail label={t("publicationDirectorLabel")}>
                    {legal.publicationDirector}
                  </LegalDetail>
                ) : null}
                <LegalDetail label={t("emailLabel")}>
                  <a className={linkClass} href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                </LegalDetail>
              </dl>
            </section>

            <section className={sectionClass}>
              <h2 className="text-lg font-semibold text-foreground">
                {t("hosting")}
              </h2>
              <p className="mt-3">
                {t.rich("hostingText", {
                  vercel: externalLink("https://vercel.com"),
                })}
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className="text-lg font-semibold text-foreground">
                {t("intellectualProperty")}
              </h2>
              <p className="mt-3">{t("intellectualPropertyText")}</p>
            </section>

            <section className={sectionClass}>
              <h2 className="text-lg font-semibold text-foreground">
                {t("personalData")}
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("controller")}
                  </h3>
                  <p className="mt-1">
                    {t.rich("controllerText", {
                      brand: brand.name,
                      email: () => (
                        <a className={linkClass} href={`mailto:${contactEmail}`}>
                          {contactEmail}
                        </a>
                      ),
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("dataAndPurposes")}
                  </h3>
                  <p className="mt-1">{t("dataAndPurposesText")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("legalBases")}
                  </h3>
                  <p className="mt-1">{t("legalBasesText")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("recipients")}
                  </h3>
                  <p className="mt-1">{t("recipientsText")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("retention")}
                  </h3>
                  <p className="mt-1">{t("retentionText")}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("security")}
                  </h3>
                  <p className="mt-1">
                    {t.rich("securityText", {
                      turnstile: externalLink(
                        "https://www.cloudflare.com/products/turnstile/"
                      ),
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("rights")}
                  </h3>
                  <p className="mt-1">
                    {t.rich("rightsText", {
                      email: () => (
                        <a className={linkClass} href={`mailto:${contactEmail}`}>
                          {contactEmail}
                        </a>
                      ),
                      cnil: externalLink("https://www.cnil.fr/fr/plaintes"),
                    })}
                  </p>
                </div>
                <p>{t("noSale")}</p>
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="text-lg font-semibold text-foreground">
                {t("cookies")}
              </h2>
              <p className="mt-3">{t("cookiesText")}</p>
              <ul className="mt-3 list-disc space-y-2 ps-5">
                <li>{t("localeCookie")}</li>
                <li>{t("turnstileCookie")}</li>
              </ul>
              <p className="mt-3">{t("cookieConsent")}</p>
            </section>

            {legal.mediatorName ? (
              <section className={sectionClass}>
                <h2 className="text-lg font-semibold text-foreground">
                  {t("mediation")}
                </h2>
                <p className="mt-3">{t("mediationText")}</p>
                <p className="mt-2">
                  {legal.mediatorName}
                  {legal.mediatorAddress ? (
                    <>
                      <br />
                      {legal.mediatorAddress}
                    </>
                  ) : null}
                  {legal.mediatorUrl ? (
                    <>
                      <br />
                      <a
                        href={legal.mediatorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {t("mediatorWebsite")}
                      </a>
                    </>
                  ) : null}
                </p>
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </>
  );
}

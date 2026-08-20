import { getLocale, getTranslations } from "next-intl/server";
import { absoluteUrl, routes } from "@/lib/routes";
import { brand } from "@/lib/brand";
import { getSiteSettings } from "@/lib/social/store";
import { absoluteUrlWithoutSearch } from "@/lib/seo/listing-jsonld";
import type { Locale } from "@/i18n/routing";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

/** Sérialisation sûre recommandée par Next.js pour les données structurées. */
export function JsonLd({
  data,
  nonce,
}: {
  data: JsonLdValue;
  nonce?: string;
}) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

const KNOWS_ABOUT = [
  "Web development",
  "Web applications",
  "E-commerce",
  "Custom software development",
];

export async function OrganizationJsonLd({ nonce }: { nonce?: string }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({ locale, namespace: "meta" });
  const settings = await getSiteSettings();
  const homeUrl = absoluteUrl(routes.home);
  const description = t("description");
  const sameAs = [
    settings.discord,
    settings.whatsapp,
    settings.instagram,
    settings.tiktok,
  ].filter((url): url is string => Boolean(url));
  const logoUrl = absoluteUrlWithoutSearch(absoluteUrl(brand.profileImage));

  const organization = {
    "@type": "Organization",
    "@id": `${homeUrl}#organization`,
    name: brand.name,
    url: homeUrl,
    description,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      contentUrl: logoUrl,
      caption: brand.profileImageAlt,
    },
    image: logoUrl,
    knowsAbout: KNOWS_ABOUT,
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${homeUrl}#website`,
    url: homeUrl,
    name: brand.name,
    description,
    inLanguage: ["fr", "en", "ar"],
    publisher: { "@id": `${homeUrl}#organization` },
  };

  const professionalService = {
    "@type": "ProfessionalService",
    "@id": `${homeUrl}#service`,
    name: `${brand.name} — ${brand.titleSuffix}`,
    url: homeUrl,
    description,
    provider: { "@id": `${homeUrl}#organization` },
    availableLanguage: ["fr", "en", "ar"],
    knowsAbout: KNOWS_ABOUT,
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [organization, website, professionalService],
  };

  return <JsonLd data={schema} nonce={nonce} />;
}

/** @deprecated Utiliser OrganizationJsonLd */
export const PersonJsonLd = OrganizationJsonLd;

import { absoluteUrl, routes } from "@/lib/routes";
import { brand } from "@/lib/brand";
import { getSiteSettings } from "@/lib/social/store";

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

export async function OrganizationJsonLd({ nonce }: { nonce?: string }) {
  const settings = await getSiteSettings();
  const homeUrl = absoluteUrl(routes.home);
  const sameAs = [
    settings.discord,
    settings.whatsapp,
    settings.instagram,
    settings.tiktok,
  ].filter(Boolean);

  const organization = {
    "@type": "Organization",
    "@id": `${homeUrl}#organization`,
    name: brand.name,
    url: homeUrl,
    email: settings.contactEmail,
    description: brand.description,
    logo: absoluteUrl(brand.profileImage),
    sameAs,
  };

  const website = {
    "@type": "WebSite",
    "@id": `${homeUrl}#website`,
    url: homeUrl,
    name: brand.name,
    description: brand.description,
    inLanguage: ["fr", "en", "ar"],
    publisher: { "@id": `${homeUrl}#organization` },
  };

  const professionalService = {
    "@type": "ProfessionalService",
    "@id": `${homeUrl}#service`,
    name: `${brand.name} — ${brand.titleSuffix}`,
    url: homeUrl,
    description: brand.description,
    provider: { "@id": `${homeUrl}#organization` },
    areaServed: "FR",
    email: settings.contactEmail,
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [organization, website, professionalService],
  };

  return <JsonLd data={schema} nonce={nonce} />;
}

/** @deprecated Utiliser OrganizationJsonLd */
export const PersonJsonLd = OrganizationJsonLd;

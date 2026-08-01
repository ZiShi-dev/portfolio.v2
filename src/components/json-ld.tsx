import { absoluteUrl, routes } from "@/lib/routes";
import { brand } from "@/lib/brand";
import { getSiteSettings } from "@/lib/social/store";

export async function PersonJsonLd() {
  const settings = await getSiteSettings();
  const homeUrl = absoluteUrl(routes.home);
  const sameAs = [
    settings.discord,
    settings.whatsapp,
    settings.instagram,
    settings.tiktok,
  ].filter(Boolean);

  const person = {
    "@type": "Person",
    "@id": `${homeUrl}#person`,
    name: brand.name,
    url: homeUrl,
    email: settings.contactEmail,
    jobTitle: "Développeur web freelance",
    description: brand.description,
    image: absoluteUrl(brand.profileImage),
    sameAs,
  };

  const website = {
    "@type": "WebSite",
    "@id": `${homeUrl}#website`,
    url: homeUrl,
    name: brand.name,
    description: brand.description,
    inLanguage: ["fr", "en", "ar"],
    publisher: { "@id": `${homeUrl}#person` },
  };

  const professionalService = {
    "@type": "ProfessionalService",
    "@id": `${homeUrl}#service`,
    name: `${brand.name} — Développement web`,
    url: homeUrl,
    description: brand.description,
    provider: { "@id": `${homeUrl}#person` },
    areaServed: "FR",
    email: settings.contactEmail,
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [person, website, professionalService],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

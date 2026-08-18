import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectInquiryFlow } from "@/components/project-inquiry/project-inquiry-flow";
import { resolveOfferInquiryProfile } from "@/data/project-inquiry-offer-profiles";
import {
  PROJECT_INQUIRY_TYPES,
  type ProjectInquirySource,
  type ProjectInquiryType,
} from "@/data/project-inquiry-options";
import { brand } from "@/lib/brand";
import type { Locale } from "@/i18n/routing";
import { createPageMetadata, routes } from "@/lib/routes";
import { getSiteProjectBySlug } from "@/lib/projects/site";
import { getSiteServiceBySlug } from "@/lib/services/site";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectInquiry" });

  return createPageMetadata({
    title: t("meta.title", { brand: brand.name }),
    description: t("meta.description", { brand: brand.name }),
    path: routes.startProject,
    locale: locale as Locale,
  });
}

export default async function StartProjectPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const serviceSlug = firstParam(sp.service);
  const listingSlugParam = firstParam(sp.listing);
  const typeParam = firstParam(sp.type);
  const intentParam = firstParam(sp.intent);

  let initialProjectType: ProjectInquiryType | null = null;
  let serviceId: string | null = null;
  let serviceReference: string | null = null;
  let resolvedServiceSlug: string | null = null;
  let serviceTitle: string | null = null;
  let listingSlug: string | null = null;
  let listingTitle: string | null = null;
  let source: ProjectInquirySource = "start-project-page";

  if (
    typeParam &&
    (PROJECT_INQUIRY_TYPES as readonly string[]).includes(typeParam)
  ) {
    initialProjectType = typeParam as ProjectInquiryType;
  }

  if (listingSlugParam) {
    const listing = await getSiteProjectBySlug(
      locale as Locale,
      listingSlugParam
    );
    if (listing?.categoryKey === "for_sale") {
      listingSlug = listing.slug ?? listingSlugParam;
      listingTitle = listing.title;
      source = "listing";
      initialProjectType = listing.businessTypeIds?.includes("ecommerce")
        ? "ecommerce"
        : "other";
    }
  }

  if (serviceSlug) {
    const service = await getSiteServiceBySlug(locale as Locale, serviceSlug);
    if (service) {
      serviceId = service.id;
      serviceReference = service.reference;
      resolvedServiceSlug = service.slug;
      serviceTitle = service.title;
      source = intentParam === "buy" ? "service-buy" : "service";
      const profile = resolveOfferInquiryProfile(
        service.slug,
        service.inquiryProjectType
      );
      if (profile) {
        initialProjectType = profile.projectType;
      } else if (!initialProjectType && service.inquiryProjectType) {
        initialProjectType = service.inquiryProjectType;
      }
    }
  }

  return (
    <main id="main-content" className="min-h-dvh">
      <ProjectInquiryFlow
        source={source}
        fullscreen
        initialProjectType={initialProjectType}
        serviceId={serviceId}
        serviceReference={serviceReference}
        serviceSlug={resolvedServiceSlug}
        serviceTitle={serviceTitle}
        listingSlug={listingSlug}
        listingTitle={listingTitle}
      />
    </main>
  );
}

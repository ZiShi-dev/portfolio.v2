import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectInquiryFlow } from "@/components/project-inquiry/project-inquiry-flow";
import {
  PROJECT_INQUIRY_TYPES,
  type ProjectInquiryType,
} from "@/data/project-inquiry-options";
import { brand } from "@/lib/brand";
import { createPageMetadata, routes } from "@/lib/routes";
import { getPublishedServiceBySlug } from "@/lib/services/store";

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
  });
}

export default async function StartProjectPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const serviceSlug = firstParam(sp.service);
  const typeParam = firstParam(sp.type);
  const serviceIdParam = firstParam(sp.serviceId);
  const refParam = firstParam(sp.ref);
  const intentParam = firstParam(sp.intent);

  let initialProjectType: ProjectInquiryType | null = null;
  let serviceId: string | null = serviceIdParam ?? null;
  let serviceReference: string | null = refParam ?? null;
  let source = "start-project-page";

  if (
    typeParam &&
    (PROJECT_INQUIRY_TYPES as readonly string[]).includes(typeParam)
  ) {
    initialProjectType = typeParam as ProjectInquiryType;
  }

  if (serviceSlug) {
    const service = await getPublishedServiceBySlug(serviceSlug);
    if (service) {
      serviceId = service.id;
      serviceReference = service.reference;
      source =
        intentParam === "buy" ? "service-buy" : "service";
      if (!initialProjectType && service.inquiry_project_type) {
        initialProjectType = service.inquiry_project_type;
      }
    }
  } else if (intentParam === "buy") {
    source = "service-buy";
  }

  return (
    <main id="main-content" className="min-h-dvh">
      <ProjectInquiryFlow
        source={source}
        fullscreen
        initialProjectType={initialProjectType}
        serviceId={serviceId}
        serviceReference={serviceReference}
      />
    </main>
  );
}

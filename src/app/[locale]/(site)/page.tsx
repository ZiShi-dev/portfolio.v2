import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getLocale, getTranslations } from "next-intl/server";
import { HomeSection } from "@/components/sections/home";
import { Services } from "@/components/sections/services";
import { brand } from "@/lib/brand";
import { createPageMetadata, routes } from "@/lib/routes";
import { getPublishedReviews } from "@/lib/reviews/store";
import { getSiteProjects } from "@/lib/projects/site";
import { getSiteServices } from "@/lib/services/site";
import { getSiteEngagements } from "@/lib/engagements/site";
import { getSiteGeneralFaqs } from "@/lib/faqs/site";
import type { Locale } from "@/i18n/routing";

const Journey = dynamic(
  () => import("@/components/sections/journey").then((m) => m.Journey)
);
const Projects = dynamic(
  () => import("@/components/sections/projects").then((m) => m.Projects)
);
const About = dynamic(
  () => import("@/components/sections/about").then((m) => m.About)
);
const Testimonials = dynamic(
  () => import("@/components/sections/testimonials").then((m) => m.Testimonials)
);
const Engagements = dynamic(
  () =>
    import("@/components/sections/engagements").then((m) => m.Engagements)
);
const FaqSection = dynamic(
  () => import("@/components/sections/faq").then((m) => m.FaqSection)
);

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return createPageMetadata({
    title: `${brand.name} — ${t("title")}`,
    description: t("description"),
    path: routes.home,
    locale: locale as Locale,
  });
}

export default async function Home() {
  const locale = (await getLocale()) as Locale;
  const [reviews, projects, services, engagements, faqs] = await Promise.all([
    getPublishedReviews(),
    getSiteProjects(locale),
    getSiteServices(locale),
    getSiteEngagements(locale),
    getSiteGeneralFaqs(locale),
  ]);

  return (
    <>
      <HomeSection />
      <Services services={services} />
      <Engagements engagements={engagements} />
      <Journey />
      <Projects projects={projects} />
      <Testimonials reviews={reviews} />
      <About />
      <FaqSection faqs={faqs} />
    </>
  );
}

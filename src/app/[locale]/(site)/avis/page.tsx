import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { brand } from "@/lib/brand";
import { createPageMetadata, routes } from "@/lib/routes";
import { getPublishedReviews } from "@/lib/reviews/store";
import type { Locale } from "@/i18n/routing";

const ReviewsPage = dynamic(
  () => import("@/components/sections/reviews-page").then((m) => m.ReviewsPage)
);

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return createPageMetadata({
    title: t("reviewsTitle", { brand: brand.name }),
    description: t("reviewsDescription", { brand: brand.name }),
    path: routes.reviews,
    locale: locale as Locale,
  });
}

export default async function AvisRoute() {
  const reviews = await getPublishedReviews();
  return <ReviewsPage reviews={reviews} />;
}

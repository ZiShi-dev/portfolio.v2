import type { Metadata } from "next";
import { ContactPageTrigger } from "@/components/contact-page-trigger";
import { Contact } from "@/components/sections/contact";
import { PageBackBar } from "@/components/page-back-link";
import { brand } from "@/lib/brand";
import { createPageMetadata, routes } from "@/lib/routes";
import { getPublicContactEmail } from "@/lib/social/store";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return createPageMetadata({
    title: t("contactTitle", { brand: brand.name }),
    description: t("contactDescription", { brand: brand.name }),
    path: routes.contact,
    locale: locale as Locale,
  });
}

export default async function ContactPage() {
  const t = await getTranslations("common");
  const contactEmail = await getPublicContactEmail();

  return (
    <>
      <ContactPageTrigger />
      <PageBackBar href={routes.home} label={t("backHome")} />
      <Contact contactEmail={contactEmail} />
    </>
  );
}

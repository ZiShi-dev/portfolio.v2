import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { SitePageBackground } from "@/components/site-page-background";
import { Footer } from "@/components/footer";
import { NavigationProgress } from "@/components/navigation-progress";
import { HashSectionScroll } from "@/components/hash-section-scroll";
import { SkipToContent } from "@/components/skip-to-content";
import { FloatingContactButton } from "@/components/floating-contact-button";
import { FloatingLanguageButton } from "@/components/floating-language-button";
import { FloatingActionsProvider } from "@/components/floating-actions-provider";
import { LeaveReviewModal } from "@/components/sections/leave-review-modal";
import { ContactModal } from "@/components/sections/contact-modal";
import { AppToastHost } from "@/components/ui/app-toast";
import { type Locale, routing } from "@/i18n/routing";
import { buildFooterSocials } from "@/lib/brand";
import { getSiteSettings } from "@/lib/social/store";
import { Suspense } from "react";
import type { SiteSettings } from "@/data/site-social";

type SiteLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params;

  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale as Locale);
  }

  const settings = getSiteSettings();

  return (
    <>
      <SkipToContent />
      <HashSectionScroll />
      <NavigationProgress />
      <Navbar key={locale} />
      <main id="main-content" className="min-h-dvh flex-1 overflow-x-clip bg-background">
        <SitePageBackground>{children}</SitePageBackground>
      </main>
      <LeaveReviewModal showCallout={false} />
      <FloatingActionsProvider key={locale}>
        <FloatingLanguageButton />
        <Suspense fallback={null}><SiteContactChrome settings={settings} /></Suspense>
      </FloatingActionsProvider>
      <AppToastHost />
    </>
  );
}

async function SiteContactChrome({ settings: pending }: { settings: Promise<SiteSettings> }) {
  const settings = await pending;
  const socials = buildFooterSocials(settings, settings.contactPriority);
  return <>
    <Footer contactEmail={settings.contactEmail} socials={socials} />
    <ContactModal showCallout={false} contactEmail={settings.contactEmail} />
    <FloatingContactButton contactEmail={settings.contactEmail} socials={socials} />
  </>;
}

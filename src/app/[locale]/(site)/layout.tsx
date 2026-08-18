import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { NavigationProgress } from "@/components/navigation-progress";
import { ScrollRestoration } from "@/components/scroll-restoration";
import { HashSectionScroll } from "@/components/hash-section-scroll";
import { SkipToContent } from "@/components/skip-to-content";
import { CelestialPageSplash } from "@/components/celestial-page-loader";
import { FloatingContactButton } from "@/components/floating-contact-button";
import { LeaveReviewModal } from "@/components/sections/leave-review-modal";
import { ContactModal } from "@/components/sections/contact-modal";
import { AppToastHost } from "@/components/ui/app-toast";
import { type Locale, routing } from "@/i18n/routing";
import { buildFooterSocials } from "@/lib/brand";
import { getSiteSettings } from "@/lib/social/store";

type SiteLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params;

  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale as Locale);
  }

  const settings = await getSiteSettings();
  const socials = buildFooterSocials(settings, settings.contactPriority);

  return (
    <>
      <CelestialPageSplash />
      <SkipToContent />
      <ScrollRestoration />
      <HashSectionScroll />
      <NavigationProgress />
      <Navbar key={locale} />
      <main id="main-content" className="min-h-dvh flex-1 overflow-x-clip bg-background">
        {children}
      </main>
      <Footer contactEmail={settings.contactEmail} socials={socials} />
      <LeaveReviewModal showCallout={false} />
      <ContactModal showCallout={false} contactEmail={settings.contactEmail} />
      <FloatingContactButton
        contactEmail={settings.contactEmail}
        socials={socials}
      />
      <AppToastHost />
    </>
  );
}

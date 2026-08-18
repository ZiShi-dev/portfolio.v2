import type { Metadata } from "next";
import {
  Amiri,
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans_Arabic,
  Instrument_Sans,
} from "next/font/google";
import { getLocale } from "next-intl/server";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import { OrganizationJsonLd } from "@/components/json-ld";
import { brand } from "@/lib/brand";
import { getLocaleDirection, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-body",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark" as const,
};

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: `${brand.name} — ${brand.titleSuffix}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  authors: [{ name: brand.owner }],
  creator: brand.owner,
  robots: { index: true, follow: true },
  openGraph: {
    title: `${brand.name} — ${brand.titleSuffix}`,
    description: brand.description,
    url: brand.siteUrl,
    siteName: brand.name,
    locale: "fr_FR",
    type: "website",
    images: [{ url: brand.heroBanner, alt: brand.heroBannerAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.titleSuffix}`,
    description: brand.description,
    images: [brand.heroBanner],
  },
  icons: {
    icon: [
      { url: "/images/favicon-32.png?v=x", type: "image/png", sizes: "32x32" },
      { url: "/images/favicon-192.png?v=x", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/images/favicon-180.png?v=x", type: "image/png", sizes: "180x180" }],
    shortcut: "/images/favicon-32.png?v=x",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as Locale;
  const dir = getLocaleDirection(locale);
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang={locale}
      dir={dir}
      translate="no"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        fraunces.variable,
        instrumentSans.variable,
        ibmPlexMono.variable,
        amiri.variable,
        ibmPlexArabic.variable,
        "dark h-full antialiased"
      )}
      style={{ colorScheme: "dark" }}
    >
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground">
        <Script
          id="clear-legacy-theme"
          strategy="beforeInteractive"
          nonce={nonce}
        >
          {`try{localStorage.removeItem('portfolio-theme');document.cookie='portfolio-theme=;path=/;max-age=0;SameSite=Lax';if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){var urls=[r.active,r.waiting,r.installing].filter(Boolean).map(function(w){return w.scriptURL||''});if(urls.some(function(u){return u.indexOf('admin-push-sw')!==-1}))return;r.unregister()})})}}catch(e){}`}
        </Script>
        <OrganizationJsonLd nonce={nonce} />
        {children}
      </body>
    </html>
  );
}

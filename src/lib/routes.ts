import { brand } from "@/lib/brand";
import { ogLocales, type Locale } from "@/i18n/routing";

/** Chemins canoniques du site — URLs SEO en français, sans slash final. */
export const routes = {
  home: "/",
  projects: "/projets",
  services: "/offres",
  reviews: "/avis",
  leaveReview: "/laisser-un-avis",
  contact: "/contact",
  startProject: "/demarrer-un-projet",
  legal: "/mentions-legales",
  admin: "/admin",
  adminLogin: "/admin/connexion",
} as const;

/** Ancres sur la page d'accueil (scroll interne uniquement). */
export const homeAnchors = {
  services: "#services",
  engagements: "#engagements",
  journey: "#parcours",
  projects: "#projets",
  about: "#a-propos",
  reviews: "#avis",
  faq: "#faq",
  contact: "#contact",
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];

export function absoluteUrl(path: RoutePath | string) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${brand.siteUrl.replace(/\/$/, "")}${normalized}`;
}

/** Chemin public stable d’une page dans une langue donnée. */
export function localizedPath(path: RoutePath | string, locale: Locale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "fr") return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function localizedAbsoluteUrl(path: RoutePath | string, locale: Locale) {
  return absoluteUrl(localizedPath(path, locale));
}

/** Ensemble réciproque hreflang, avec le français comme x-default. */
export function localizedAlternates(path: RoutePath | string) {
  return {
    fr: localizedAbsoluteUrl(path, "fr"),
    en: localizedAbsoluteUrl(path, "en"),
    ar: localizedAbsoluteUrl(path, "ar"),
    "x-default": localizedAbsoluteUrl(path, "fr"),
  };
}

export function homeSectionUrl(section: keyof typeof homeAnchors) {
  return `${routes.home}${homeAnchors[section]}`;
}

/** URL détail d’une offre. */
export function serviceDetailPath(slug: string) {
  return `${routes.services}/${slug}`;
}

/** Lien public d’un avis publié. */
export function reviewPublicPath(id: string) {
  return `${routes.reviews}?r=${encodeURIComponent(id)}`;
}

/** Invitation client à laisser un avis lié à un projet. */
export function reviewInvitePath(projectId: string) {
  return `/?openReview=1&project=${encodeURIComponent(projectId)}`;
}

/** Intention commerciale depuis une offre (achat vs démarrage sur-mesure). */
export type StartProjectIntent = "start" | "buy";

/**
 * Lien vers le parcours « Démarrer un projet » avec contexte offre.
 * Le visiteur peut toujours modifier son choix dans le wizard.
 */
export function startProjectUrl(opts?: {
  serviceSlug?: string | null;
  projectType?: string | null;
  intent?: StartProjectIntent | null;
  /** Slug d’un projet à vendre (page listing). */
  listingSlug?: string | null;
}): string {
  const params = new URLSearchParams();
  if (opts?.serviceSlug) params.set("service", opts.serviceSlug);
  if (opts?.listingSlug) params.set("listing", opts.listingSlug);
  if (opts?.projectType) params.set("type", opts.projectType);
  if (opts?.intent === "buy" || opts?.intent === "start") {
    params.set("intent", opts.intent);
  }
  const q = params.toString();
  return q ? `${routes.startProject}?${q}` : routes.startProject;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: RoutePath | string;
  index?: boolean;
  locale?: Locale;
  /** `null` laisse une convention opengraph-image/twitter-image plus spécifique prendre la main. */
  image?: { src: string; alt: string } | null;
};

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
  locale = "fr",
  image = { src: brand.heroBanner, alt: brand.heroBannerAlt },
}: PageMetaInput) {
  const url = localizedAbsoluteUrl(path, locale);
  const imageUrl = image ? absoluteUrl(image.src) : null;

  return {
    // Les titres de pages incluent déjà la marque : empêcher le template racine
    // de produire « … VORZIX · VORZIX ».
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: localizedAlternates(path),
    },
    openGraph: {
      title,
      description,
      url,
      type: "website" as const,
      locale: ogLocales[locale],
      alternateLocale: (Object.keys(ogLocales) as Locale[])
        .filter((code) => code !== locale)
        .map((code) => ogLocales[code]),
      siteName: brand.name,
      ...(imageUrl && image
        ? { images: [{ url: imageUrl, alt: image.alt }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large" as const,
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false },
  };
}

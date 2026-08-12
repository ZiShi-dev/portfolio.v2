import { brand } from "@/lib/brand";

/** Chemins canoniques du site — URLs SEO en français, sans slash final. */
export const routes = {
  home: "/",
  projects: "/projets",
  services: "/offres",
  /** Catalogue des offres à vendre (sites / produits prêts). */
  forSale: "/a-vendre",
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
  forSale: "#a-vendre",
  engagements: "#engagements",
  journey: "#parcours",
  /** Les projets s’affichent dans Catalogue · Offres (#services). */
  projects: "#services",
  about: "#a-propos",
  reviews: "#avis",
  faq: "#faq",
  contact: "#contact",
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];

export function absoluteUrl(path: RoutePath | string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${brand.siteUrl.replace(/\/$/, "")}${normalized}`;
}

export function homeSectionUrl(section: keyof typeof homeAnchors) {
  return `${routes.home}${homeAnchors[section]}`;
}

/** URL détail d’une offre service (/offres). */
export function serviceDetailPath(slug: string) {
  return `${routes.services}/${slug}`;
}

/** URL détail d’une offre à vendre (/a-vendre). */
export function saleDetailPath(slug: string) {
  return `${routes.forSale}/${slug}`;
}

/** URL publique détail selon le type d’offre. */
export function offerDetailPath(
  slug: string,
  kind: "service" | "product" = "service"
) {
  return kind === "product" ? saleDetailPath(slug) : serviceDetailPath(slug);
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
}): string {
  const params = new URLSearchParams();
  if (opts?.serviceSlug) params.set("service", opts.serviceSlug);
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
};

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetaInput) {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website" as const,
      locale: "fr_FR",
      siteName: brand.name,
      images: [
        {
          url: absoluteUrl(brand.heroBanner),
          alt: brand.heroBannerAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [absoluteUrl(brand.heroBanner)],
    },
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}

"use client";

import { Link } from "@/i18n/navigation";
import {
  routes,
  startProjectUrl,
  type StartProjectIntent,
} from "@/lib/routes";

type ContactOpenLinkProps = {
  children: React.ReactNode;
  className?: string;
  onOpen?: () => void;
  /** URL complète optionnelle (ex. startProjectUrl({...})). */
  href?: string;
  serviceSlug?: string | null;
  serviceId?: string | null;
  serviceReference?: string | null;
  projectType?: string | null;
  /** Achat d’offre à prix vs démarrage sur-mesure. */
  intent?: StartProjectIntent | null;
  listingSlug?: string | null;
};

/** CTA « démarrer / acheter / contact projet » → parcours interactif. */
export function ContactOpenLink({
  children,
  className,
  onOpen,
  href,
  serviceSlug,
  serviceId,
  serviceReference,
  projectType,
  intent,
  listingSlug,
}: ContactOpenLinkProps) {
  const resolved =
    href ??
    (serviceSlug ||
    serviceId ||
    serviceReference ||
    projectType ||
    intent ||
    listingSlug
      ? startProjectUrl({
          serviceSlug,
          projectType,
          intent,
          listingSlug,
        })
      : routes.startProject);

  return (
    <Link
      href={resolved}
      className={className}
      onClick={() => {
        onOpen?.();
      }}
    >
      {children}
    </Link>
  );
}

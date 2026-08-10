"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { OPEN_CONTACT_EVENT } from "@/lib/open-contact-modal";
import { startNavigationProgress } from "@/lib/navigation-progress";
import { homeAnchors, routes } from "@/lib/routes";

type ContactModalProps = {
  showCallout?: boolean;
  contactEmail: string;
};

/**
 * Ancien shell popup contact.
 * Les CTA projet redirigent désormais vers `/demarrer-un-projet`.
 * Conservé pour intercepter les events/hash legacy.
 */
export function ContactModal({
  showCallout = true,
}: ContactModalProps) {
  const router = useRouter();

  useEffect(() => {
    function goToProjectFlow() {
      startNavigationProgress();
      router.push(routes.startProject);
    }

    document.addEventListener(OPEN_CONTACT_EVENT, goToProjectFlow);

    if (window.location.hash === homeAnchors.contact) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
      goToProjectFlow();
    }

    return () => {
      document.removeEventListener(OPEN_CONTACT_EVENT, goToProjectFlow);
    };
  }, [router]);

  // Plus de popup visuelle — le parcours est une page dédiée.
  if (!showCallout) return null;
  return null;
}

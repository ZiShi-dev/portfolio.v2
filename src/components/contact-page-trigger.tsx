"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { startNavigationProgress } from "@/lib/navigation-progress";
import { routes } from "@/lib/routes";

/** Ancienne page /contact → parcours Démarrer un projet. */
export function ContactPageTrigger() {
  const router = useRouter();

  useEffect(() => {
    startNavigationProgress();
    try {
      router.replace(routes.startProject);
    } catch {
      window.location.replace(routes.startProject);
    }
  }, [router]);

  return null;
}

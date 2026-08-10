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
    router.replace(routes.startProject);
  }, [router]);

  return null;
}

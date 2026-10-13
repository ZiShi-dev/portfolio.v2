"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CelestialAtlas } from "@/components/ui/celestial-atlas";

export function SitePageBackground({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = /^\/(?:fr|en|ar)?\/?$/.test(pathname);
  if (home) return <>{children}</>;
  return (
    <div className="star-page relative isolate min-h-dvh bg-background">
      <CelestialAtlas intensity="subtle" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

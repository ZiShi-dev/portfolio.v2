import type { ReactNode } from "react";

/** A short CSS fade keeps route transitions independent of client hydration. */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="page-arrival">{children}</div>;
}

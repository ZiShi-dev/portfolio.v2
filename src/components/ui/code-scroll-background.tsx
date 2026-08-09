"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Extraits stylisés — filigrane technique, pas du vrai code exécutable. */
const CODE_COLUMNS = [
  [
    "const atlas = mapStars({ epoch: 2000.0 })",
    "  .filter((s) => s.magnitude <= 2.5)",
    "  .sortBy('rightAscension')",
    "",
    "export function constellation(id: string) {",
    "  return atlas.find((c) => c.catalog === id)",
    "}",
    "",
    "// VORZIX · précision céleste",
    "type Orbit = { ra: number; dec: number }",
    "const brass = '#C9A96A'",
    "const night = '#070A12'",
    "",
    "async function deploy(product: Star) {",
    "  await measure(product.magnitude)",
    "  return engrave(product.name)",
    "}",
    "",
    "interface Platform {",
    "  sites: Site[]",
    "  apps: App[]",
    "  reliability: 'premium'",
    "}",
  ],
  [
    "SELECT catalog, magnitude",
    "FROM fixed_stars",
    "WHERE ra BETWEEN 5.5 AND 6.0",
    "ORDER BY mag ASC;",
    "",
    "route('/api/stars', {",
    "  method: 'GET',",
    "  cache: 'force-cache',",
    "})",
    "",
    "const grid = equatorial({",
    "  step: 15,",
    "  hairline: 'rgba(212,175,122,0.18)',",
    "})",
    "",
    "export default function Hero() {",
    "  return <CelestialChart />",
    "}",
    "",
    "motion.div({",
    "  opacity: [0.6, 1, 0.6],",
    "  duration: 5,",
    "})",
  ],
  [
    "pnpm build && pnpm start",
    "✓ Compiled in 1.2s",
    "✓ Ready on :3000",
    "",
    "git commit -m 'feat: atlas tokens'",
    "git push origin main",
    "",
    "docker compose up -d api",
    "nginx -s reload",
    "",
    "curl -s https://vorzix.dev/health",
    '{ "status": "ok", "sky": "clear" }',
    "",
    "watch --files 'src/**' --run lint",
    "tsc --noEmit",
    "",
    "# magnitude · catalogue · orbit",
    "echo 'Laiton Céleste #C9A96A'",
  ],
] as const;

type CodeScrollBackgroundProps = {
  className?: string;
};

export function CodeScrollBackground({ className }: CodeScrollBackgroundProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-x-0 -top-8 bottom-0 flex justify-center gap-6 px-3 sm:gap-10 sm:px-6",
          "[mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)]"
        )}
      >
        {CODE_COLUMNS.map((lines, colIndex) => (
          <pre
            key={colIndex}
            className={cn(
              "min-w-0 flex-1 font-mono text-[11px] leading-5 tracking-wide sm:text-xs sm:leading-6",
              colIndex === 1 ? "block" : "hidden",
              colIndex === 0 && "md:block",
              colIndex === 2 && "lg:block",
              !reduceMotion && "animate-code-scroll will-change-transform"
            )}
            style={
              reduceMotion
                ? undefined
                : {
                    animationDuration: `${42 + colIndex * 8}s`,
                    animationDelay: `${-colIndex * 6}s`,
                  }
            }
          >
            {/* Double le contenu pour une boucle fluide (translateY -50%) */}
            {[0, 1].map((copy) => (
              <code key={copy} className="block whitespace-pre">
                {lines.map((line, i) => {
                  const isComment =
                    line.startsWith("//") || line.startsWith("#");
                  const isAccent =
                    line.startsWith("✓") ||
                    line.includes("brass") ||
                    line.includes("C9A96A") ||
                    line.includes("VORZIX");

                  return (
                    <span
                      key={`${copy}-${i}`}
                      className={cn(
                        "block",
                        isComment || isAccent
                          ? "text-primary/45"
                          : "text-foreground/28"
                      )}
                    >
                      {line || "\u00a0"}
                    </span>
                  );
                })}
              </code>
            ))}
          </pre>
        ))}
      </div>

      {/* Voile léger : laisse le code visible, protège surtout le centre */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-step-surface)_0%,transparent_72%)] opacity-80" />
    </div>
  );
}

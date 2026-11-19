"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-md border-t border-border-gold pt-6 text-start">
        <AlertTriangle className="size-6 text-danger" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Une erreur est survenue
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Le site a rencontré un problème inattendu. Vous pouvez réessayer ou
          revenir à l&apos;accueil.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.home}>Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

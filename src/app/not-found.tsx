import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-20 text-foreground">
      <div className="w-full max-w-md border-t border-border-gold pt-6 text-start">
        <FileQuestion className="size-6 text-primary" aria-hidden />
        <p className="mt-4 text-sm text-muted-foreground">
          Erreur 404
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Page introuvable
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Cette page n&apos;existe pas ou a été déplacée. Retournez à
          l&apos;accueil pour continuer votre visite.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href={routes.home}>Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}

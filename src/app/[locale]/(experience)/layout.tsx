import { AppToastHost } from "@/components/ui/app-toast";
import { SkipToContent } from "@/components/skip-to-content";

/**
 * Shell immersif plein écran — sans navbar / footer.
 * Réservé au parcours « Démarrer un projet ».
 */
export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipToContent />
      <div className="min-h-dvh bg-background text-foreground">{children}</div>
      <AppToastHost />
    </>
  );
}

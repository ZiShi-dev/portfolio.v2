/** Titre d’une seule traite. L’accent laiton ne s’ajoute que s’il complète la même phrase. */
export function HeadingTitle({
  title,
  highlight,
}: {
  title: string;
  highlight?: string;
}) {
  const accent = highlight?.trim();
  if (!accent) return title;
  return (
    <>
      {title} <span className="text-primary">{accent}</span>
    </>
  );
}

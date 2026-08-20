import { Link } from "@/i18n/navigation";
import { serviceDetailPath } from "@/lib/routes";

export type RelatedServiceLink = {
  slug: string;
  title: string;
};

export function ProjectTechnologies({
  items,
  title,
}: {
  items: string[];
  title: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-border bg-surface-elevated/70 px-3 py-1 font-mono text-[11px] tracking-[0.06em] text-muted-foreground"
          >
            {tech}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedServiceLinks({
  services,
  title,
}: {
  services: RelatedServiceLink[];
  title: string;
}) {
  if (services.length === 0) return null;

  return (
    <nav aria-label={title} className="mt-10 sm:mt-12">
      <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {services.map((service) => (
          <li key={service.slug}>
            <Link
              href={serviceDetailPath(service.slug)}
              className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface-elevated/80 px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {service.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

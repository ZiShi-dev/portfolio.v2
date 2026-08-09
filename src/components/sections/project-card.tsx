"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { isSafeHttpUrl } from "@/lib/review-schema";
import {
  ProjectCardPreview,
  type ProjectItem,
} from "@/components/sections/project-modal";
import { ProjectTypeBadges } from "@/components/sections/project-type-badges";
import { Link } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

type ProjectCardProps = {
  project: ProjectItem;
  /** @deprecated Les cartes naviguent vers /projets/[slug]. Conservé pour compat. */
  onOpen?: (project: ProjectItem) => void;
  className?: string;
  priority?: boolean;
  swipeFriendly?: boolean;
};

export function ProjectCard({
  project,
  className,
  priority,
  swipeFriendly = false,
}: ProjectCardProps) {
  const t = useTranslations("projects");
  const href = `${routes.projects}/${project.slug ?? project.id}`;
  const openLabel = t("openDetails", { title: project.title });

  const cardBody = (
    <>
      <ProjectCardPreview
        image={project.images[0].src}
        title={project.title}
        count={project.images.length}
        priority={priority}
        screensLabel={t("screens")}
      />
      <div className="relative p-4 sm:p-6">
        <span
          className="absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-step-accent/25 bg-background transition-colors group-hover:border-step-accent group-hover:bg-step-accent group-hover:text-primary-foreground sm:end-4 sm:top-4"
          aria-hidden
        >
          <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        {project.reference ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
            {project.reference}
          </p>
        ) : (
          <p className="text-xs uppercase tracking-widest text-foreground/50">
            {project.category}
          </p>
        )}
        <h3 className="mt-2 pe-12 font-display-serif text-lg font-semibold leading-snug sm:text-xl">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/60">
          {project.desc}
        </p>
        <ProjectTypeBadges
          businessTypeIds={project.businessTypeIds}
          tags={project.technologies?.length ? project.technologies : project.tags}
        />
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/75">
          {t("viewCase")}
        </p>
      </div>
    </>
  );

  return (
    <motion.div
      whileHover={swipeFriendly ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={
        className ??
        "group h-full w-full overflow-hidden rounded-2xl border border-step-accent/20 bg-card/80 backdrop-blur-sm transition-colors hover:border-step-accent/45"
      }
    >
      <Link
        href={href}
        aria-label={openLabel}
        className="block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {cardBody}
      </Link>

      {((project.link && isSafeHttpUrl(project.link)) ||
        (project.appLink && isSafeHttpUrl(project.appLink))) && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border px-4 py-3 sm:px-6">
          {project.link && isSafeHttpUrl(project.link) && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex min-h-10 items-center gap-1.5 text-sm text-foreground/55 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("seeSite")}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          {project.appLink && isSafeHttpUrl(project.appLink) && (
            <a
              href={project.appLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex min-h-10 items-center gap-1.5 text-sm text-primary/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("seeApp")}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

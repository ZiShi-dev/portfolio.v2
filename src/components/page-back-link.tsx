"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export const pageShellClass = "mx-auto w-full max-w-6xl px-4 sm:px-6";
export const pageTopClass = "pt-24 sm:pt-28 md:pt-32";

type PageBackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function PageBackLink({ href, label, className }: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-foreground/55 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
      {label}
    </Link>
  );
}

export function PageBackBar({ href, label }: { href: string; label: string }) {
  return (
    <div className={cn(pageShellClass, pageTopClass)}>
      <Reveal variant="fade">
        <PageBackLink href={href} label={label} />
      </Reveal>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { BrandName } from "@/components/brand-name";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  showSubtitle?: boolean;
  showMark?: boolean;
  subtitleClassName?: string;
};

function VorzixMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-surface ring-1 ring-foreground/5",
        className
      )}
      aria-hidden
    >
      {/* img natif : évite le cache agressif de next/image sur les assets statiques */}
      {/* eslint-disable-next-line @next/next/no-img-element -- logo marque, PNG opaque nuit */}
      <img
        src={brand.profileImage}
        alt=""
        width={96}
        height={96}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function BrandLogo({
  className,
  showSubtitle = false,
  showMark = true,
  subtitleClassName,
}: BrandLogoProps) {
  const t = useTranslations("hero");

  return (
    <div className={cn("notranslate flex min-w-0 items-center gap-2.5 sm:gap-3", className)}>
      {showMark && <VorzixMark className="h-8 w-8 sm:h-9 sm:w-9" />}

      <div className="min-w-0 leading-none">
        <BrandName variant="modern" className="truncate text-[13px] sm:text-sm" />
        {showSubtitle && (
          <span
            className={cn(
              "mt-1 block truncate text-[10px] font-normal leading-snug text-foreground/45 sm:text-[11px]",
              subtitleClassName
            )}
          >
            {t("tagline")}
          </span>
        )}
      </div>
    </div>
  );
}

export function BrandLogoFooter() {
  const t = useTranslations("hero");

  return (
    <div className="notranslate flex items-center gap-2.5">
      <VorzixMark className="h-9 w-9" />
      <div className="min-w-0 leading-none">
        <BrandName variant="modern" className="text-sm" />
        <span className="mt-1 block text-xs font-normal text-foreground/45">
          {t("tagline")}
        </span>
      </div>
    </div>
  );
}

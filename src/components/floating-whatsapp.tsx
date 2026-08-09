"use client";

import { SiWhatsapp } from "react-icons/si";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type FloatingWhatsAppProps = {
  href: string;
};

/**
 * Bouton WhatsApp flottant — visible uniquement si un lien admin est configuré.
 */
export function FloatingWhatsApp({ href }: FloatingWhatsAppProps) {
  const t = useTranslations("common");
  const url = href.trim();
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappFloat")}
      className={cn(
        "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))] end-[max(1.25rem,env(safe-area-inset-right))]",
        "bg-[#25D366] text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
        "transition-[transform,box-shadow,filter] duration-200",
        "hover:scale-105 hover:brightness-110 hover:shadow-[0_10px_32px_rgba(37,211,102,0.35)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]",
        "motion-reduce:transition-none motion-reduce:hover:scale-100"
      )}
    >
      <SiWhatsapp className="h-7 w-7" aria-hidden />
    </a>
  );
}

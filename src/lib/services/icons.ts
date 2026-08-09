import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  Bot,
  Code2,
  Globe,
  Layers,
  Palette,
  Rocket,
  Search,
  Server,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Icônes autorisées pour les offres (clé = valeur stockée en DB). */
export const SERVICE_ICON_MAP = {
  "code-2": Code2,
  server: Server,
  palette: Palette,
  smartphone: Smartphone,
  search: Search,
  rocket: Rocket,
  sparkles: Sparkles,
  globe: Globe,
  "shopping-bag": ShoppingBag,
  "app-window": AppWindow,
  layers: Layers,
  bot: Bot,
  wrench: Wrench,
} as const;

export type ServiceIconKey = keyof typeof SERVICE_ICON_MAP;

export const SERVICE_ICON_KEYS = Object.keys(
  SERVICE_ICON_MAP
) as ServiceIconKey[];

export function resolveServiceIcon(key: string | null | undefined): LucideIcon {
  if (key && key in SERVICE_ICON_MAP) {
    return SERVICE_ICON_MAP[key as ServiceIconKey];
  }
  return Sparkles;
}

export function isServiceIconKey(value: string): value is ServiceIconKey {
  return value in SERVICE_ICON_MAP;
}

type ServiceIconProps = {
  name: string | null | undefined;
  className?: string;
  strokeWidth?: number;
};

/** Icône dynamique via createElement (évite le pattern JSX « composant créé au render »). */
export function ServiceIcon({
  name,
  className,
  strokeWidth = 1.5,
}: ServiceIconProps) {
  return createElement(resolveServiceIcon(name), {
    className: cn(className),
    strokeWidth,
    "aria-hidden": true,
  });
}

import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  FileCheck,
  Layers,
  LifeBuoy,
  MonitorSmartphone,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Icônes autorisées pour les engagements (clé = valeur stockée en DB). */
export const ENGAGEMENT_ICON_MAP = {
  "file-check": FileCheck,
  "clipboard-check": ClipboardCheck,
  "monitor-smartphone": MonitorSmartphone,
  layers: Layers,
  "life-buoy": LifeBuoy,
  sparkles: Sparkles,
} as const;

export type EngagementIconKey = keyof typeof ENGAGEMENT_ICON_MAP;

export const ENGAGEMENT_ICON_KEYS = Object.keys(
  ENGAGEMENT_ICON_MAP
) as EngagementIconKey[];

export function resolveEngagementIcon(
  key: string | null | undefined
): LucideIcon {
  if (key && key in ENGAGEMENT_ICON_MAP) {
    return ENGAGEMENT_ICON_MAP[key as EngagementIconKey];
  }
  return FileCheck;
}

type EngagementIconProps = {
  name: string | null | undefined;
  className?: string;
  strokeWidth?: number;
};

export function EngagementIcon({
  name,
  className,
  strokeWidth = 1.5,
}: EngagementIconProps) {
  return createElement(resolveEngagementIcon(name), {
    className: cn(className),
    strokeWidth,
    "aria-hidden": true,
  });
}

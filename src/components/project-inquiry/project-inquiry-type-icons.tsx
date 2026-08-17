import type { ReactNode } from "react";
import {
  CalendarDays,
  Globe,
  Layers,
  ListChecks,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { ProjectInquiryType } from "@/data/project-inquiry-options";

export const PROJECT_INQUIRY_TYPE_ICONS: Record<
  ProjectInquiryType,
  ReactNode
> = {
  showcase: <Globe className="h-4 w-4" />,
  ecommerce: <ShoppingBag className="h-4 w-4" />,
  web_app: <CalendarDays className="h-4 w-4" />,
  saas: <Layers className="h-4 w-4" />,
  redesign: <RefreshCw className="h-4 w-4" />,
  automation: <ListChecks className="h-4 w-4" />,
  other: <Sparkles className="h-4 w-4" />,
};

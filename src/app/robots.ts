import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/laisser-un-avis",
        "/en/laisser-un-avis",
        "/ar/laisser-un-avis",
        "/admin",
        "/admin/",
      ],
    },
    sitemap: `${absoluteUrl("/").replace(/\/$/, "")}/sitemap.xml`,
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}

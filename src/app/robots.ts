import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/laisser-un-avis", "/admin", "/admin/"],
    },
    sitemap: `${absoluteUrl("/").replace(/\/$/, "")}/sitemap.xml`,
  };
}

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import {
  createPageMetadata,
  localizedAbsoluteUrl,
  localizedPath,
  routes,
} from "@/lib/routes";

describe("SEO — sitemap & robots", () => {
  it("sitemap inclut l’accueil, le catalogue offres et les pages indexables (sans /a-propos)", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    assert.ok(urls.some((u) => /\/projets$/.test(u)));
    assert.ok(urls.some((u) => /\/avis$/.test(u)));
    assert.ok(urls.some((u) => /\/offres$/.test(u)));
    assert.equal(
      urls.some((u) => u.includes("/a-propos")),
      false
    );
    assert.equal(
      urls.some((u) => u.includes("laisser-un-avis")),
      false
    );
    assert.equal(urls.some((u) => u.includes("/admin")), false);
    assert.ok(urls.some((u) => /\/en\/projets$/.test(u)));
    assert.ok(urls.some((u) => /\/ar\/projets$/.test(u)));

    const englishProjects = entries.find((entry) =>
      /\/en\/projets$/.test(entry.url)
    );
    assert.equal(
      englishProjects?.alternates?.languages?.fr,
      localizedAbsoluteUrl(routes.projects, "fr")
    );
    assert.equal(
      englishProjects?.alternates?.languages?.en,
      localizedAbsoluteUrl(routes.projects, "en")
    );

    const home = entries.find((entry) => /\/$/.test(entry.url));
    assert.equal(
      home?.lastModified,
      undefined,
      "une page statique ne doit pas annoncer une fausse date de mise à jour"
    );
  });

  it("robots bloque admin et laisser-un-avis", () => {
    const r = robots();
    const disallow = Array.isArray(r.rules)
      ? r.rules.flatMap((x) => x.disallow ?? [])
      : r.rules.disallow ?? [];
    const list = Array.isArray(disallow) ? disallow : [disallow];
    assert.ok(list.some((d) => String(d).includes("admin")));
    assert.ok(list.some((d) => String(d).includes("laisser-un-avis")));
    assert.ok(String(r.sitemap).endsWith("/sitemap.xml"));
    assert.ok(String(r.host).startsWith("https://"));
  });

  it("createPageMetadata expose canonical + twitter + OG", () => {
    const meta = createPageMetadata({
      title: "Test",
      description: "Desc",
      path: routes.projects,
    });
    assert.equal(
      meta.alternates?.canonical?.toString().includes("/projets"),
      true
    );
    assert.equal(meta.twitter?.card, "summary_large_image");
    assert.equal(meta.openGraph?.url?.toString().includes("/projets"), true);
    assert.deepEqual(meta.title, { absolute: "Test" });
    assert.equal(meta.openGraph?.locale, "fr_FR");
    assert.equal(meta.robots?.index, true);
    assert.equal(meta.robots?.googleBot?.["max-image-preview"], "large");
  });

  it("createPageMetadata localise Open Graph et conserve les images absolues", () => {
    const meta = createPageMetadata({
      title: "Projects",
      description: "Work",
      path: routes.projects,
      locale: "en",
      image: { src: "https://cdn.example.com/work.jpg", alt: "Work" },
    });
    assert.equal(meta.openGraph?.locale, "en_US");
    assert.equal(
      meta.openGraph?.images?.[0]?.url,
      "https://cdn.example.com/work.jpg"
    );
    assert.equal(meta.alternates?.canonical, localizedAbsoluteUrl(routes.projects, "en"));
    assert.equal(
      meta.alternates?.languages?.["x-default"],
      localizedAbsoluteUrl(routes.projects, "fr")
    );
  });

  it("construit des chemins distincts pour chaque langue", () => {
    assert.equal(localizedPath(routes.projects, "fr"), "/projets");
    assert.equal(localizedPath(routes.projects, "en"), "/en/projets");
    assert.equal(localizedPath(routes.home, "ar"), "/ar");
  });

  it("permet à une image Open Graph de route de prendre la priorité", () => {
    const meta = createPageMetadata({
      title: "Project",
      description: "Case study",
      path: `${routes.projects}/project`,
      image: null,
    });
    assert.equal("images" in meta.openGraph, false);
    assert.equal("images" in meta.twitter, false);
  });

  it("leave-review est noindex via metadata helper", () => {
    const meta = createPageMetadata({
      title: "x",
      description: "y",
      path: routes.leaveReview,
      index: false,
    });
    assert.deepEqual(meta.robots, { index: false, follow: false });
  });
});

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
import {
  parseSitemapDate,
  uniqueAbsoluteHttpUrls,
} from "@/lib/seo/sitemap-utils";
import {
  trailingSlashRedirectLocation,
  wwwToApexRedirectLocation,
} from "@/lib/seo/url-normalization";
import { buildListingJsonLd } from "@/lib/seo/listing-jsonld";

describe("SEO — sitemap & robots", () => {
  it("sitemap inclut l’accueil, le catalogue offres et les pages indexables (sans /a-propos)", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    assert.ok(urls.some((u) => /\/projets$/.test(u)));
    assert.ok(urls.some((u) => /\/avis$/.test(u)));
    assert.ok(urls.some((u) => /\/offres$/.test(u)));
    assert.ok(urls.some((u) => /\/contact$/.test(u)));
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

    for (const entry of entries) {
      if (entry.lastModified) {
        const time = new Date(entry.lastModified).getTime();
        assert.equal(
          Number.isNaN(time),
          false,
          `lastModified invalide pour ${entry.url}`
        );
      }
    }
  });

  it("robots bloque admin et laisser-un-avis", () => {
    const r = robots();
    const disallow = Array.isArray(r.rules)
      ? r.rules.flatMap((x) => x.disallow ?? [])
      : r.rules.disallow ?? [];
    const list = Array.isArray(disallow) ? disallow : [disallow];
    assert.ok(list.some((d) => String(d).includes("admin")));
    assert.ok(list.some((d) => String(d).includes("laisser-un-avis")));
    assert.ok(list.some((d) => String(d).includes("/api/")));
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
    assert.deepEqual(meta.openGraph?.alternateLocale, ["en_US", "ar_SA"]);
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

describe("SEO — helpers sitemap / URLs", () => {
  it("parseSitemapDate ignore les dates invalides", () => {
    assert.equal(parseSitemapDate(undefined), undefined);
    assert.equal(parseSitemapDate(""), undefined);
    assert.equal(parseSitemapDate("null"), undefined);
    assert.equal(parseSitemapDate("not-a-date"), undefined);
    const ok = parseSitemapDate("2026-08-18T10:00:00.000Z");
    assert.ok(ok instanceof Date);
    assert.equal(ok?.toISOString(), "2026-08-18T10:00:00.000Z");
  });

  it("uniqueAbsoluteHttpUrls déduplique et ignore les schémas dangereux", () => {
    const urls = uniqueAbsoluteHttpUrls(
      [
        "/images/a.jpg",
        "/images/a.jpg",
        "https://cdn.example.com/b.jpg",
        "javascript:alert(1)",
        "",
        null,
      ],
      (path) => `https://vorzix.com${path}`
    );
    assert.deepEqual(urls, [
      "https://vorzix.com/images/a.jpg",
      "https://cdn.example.com/b.jpg",
    ]);
  });

  it("redirige www vers l’apex canonique en https", () => {
    assert.equal(
      wwwToApexRedirectLocation(
        "http://www.vorzix.com/en/projets",
        "www.vorzix.com",
        "https://vorzix.com"
      ),
      "https://vorzix.com/en/projets"
    );
    assert.equal(
      wwwToApexRedirectLocation(
        "https://vorzix.com/",
        "vorzix.com",
        "https://vorzix.com"
      ),
      null
    );
  });

  it("retire le slash final hors racine", () => {
    assert.equal(
      trailingSlashRedirectLocation("https://vorzix.com/offres/"),
      "https://vorzix.com/offres"
    );
    assert.equal(trailingSlashRedirectLocation("https://vorzix.com/"), null);
  });

  it("buildListingJsonLd ajoute ItemList seulement s’il y a des items", () => {
    const empty = buildListingJsonLd({
      name: "Offres",
      url: "https://vorzix.com/offres",
      items: [],
    });
    assert.equal(Array.isArray(empty["@graph"]), true);
    assert.equal(
      (empty["@graph"] as Record<string, unknown>[]).some(
        (node) => node["@type"] === "ItemList"
      ),
      false
    );

    const filled = buildListingJsonLd({
      name: "Offres",
      url: "https://vorzix.com/offres",
      items: [{ name: "Vitrine", url: "https://vorzix.com/offres/vitrine" }],
    });
    const list = (filled["@graph"] as Record<string, unknown>[]).find(
      (node) => node["@type"] === "ItemList"
    );
    assert.equal(list?.numberOfItems, 1);
  });
});

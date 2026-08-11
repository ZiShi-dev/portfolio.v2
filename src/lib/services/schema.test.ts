import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseServicePatchBody,
  parseServiceReorderBody,
  parseServiceWriteBody,
  slugifyServiceTitle,
} from "@/lib/services/schema";
import {
  formatServicePrice,
  parseEurosToCents,
  resolveServicePriceDisplay,
} from "@/lib/services/pricing";

function valid(overrides: Record<string, unknown> = {}) {
  return {
    reference: "VZ—WEB",
    slug: "sites-professionnels",
    icon: "globe",
    status: "draft",
    featured: false,
    sortOrder: 10,
    title: { fr: "Sites professionnels", en: "Professional sites", ar: "مواقع احترافية" },
    shortDescription: {
      fr: "Présence en ligne claire pour votre activité.",
      en: "A clear online presence for your business.",
      ar: "حضور واضح على الإنترنت لنشاطك.",
    },
    description: { fr: "", en: "", ar: "" },
    idealFor: { fr: "", en: "", ar: "" },
    includedFeatures: [],
    ctaLabel: { fr: "", en: "", ar: "" },
    offerKind: "service",
    showCtaBuy: false,
    showCtaStart: true,
    pricingMode: "quote_only",
    startingPriceCents: null,
    currency: "EUR",
    inquiryProjectType: null,
    caseStudyIds: [],
    seoTitle: { fr: "", en: "", ar: "" },
    seoDescription: { fr: "", en: "", ar: "" },
    ...overrides,
  };
}

describe("services schema", () => {
  it("accepte une offre brouillon minimale", () => {
    const parsed = parseServiceWriteBody(valid());
    assert.equal(parsed.ok, true);
  });

  it("exige un prix pour starting_at", () => {
    const parsed = parseServiceWriteBody(
      valid({ pricingMode: "starting_at", startingPriceCents: null })
    );
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.error, "starting_price_required");
  });

  it("accepte starting_at avec cents", () => {
    const parsed = parseServiceWriteBody(
      valid({
        pricingMode: "starting_at",
        startingPriceCents: 90000,
        status: "published",
        title: {
          fr: "Sites pro",
          en: "Pro sites",
          ar: "مواقع",
        },
        shortDescription: {
          fr: "Description courte FR",
          en: "Short EN",
          ar: "قصير",
        },
      })
    );
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.values.startingPriceCents, 90000);
  });

  it("refuse publication sans titre FR", () => {
    const parsed = parseServiceWriteBody(
      valid({
        status: "published",
        title: { fr: "", en: "X", ar: "Y" },
        shortDescription: { fr: "Ok", en: "", ar: "" },
      })
    );
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.error, "publish_requires_title");
  });

  it("rejette slug invalide", () => {
    const parsed = parseServiceWriteBody(valid({ slug: "Bad Slug!" }));
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.error, "service_invalid_slug");
  });

  it("accepte les destinations projet lié et page projets", () => {
    for (const detailCtaType of ["linked_project", "projects"]) {
      const parsed = parseServiceWriteBody(valid({ detailCtaType }));
      assert.equal(parsed.ok, true, detailCtaType);
    }
  });

  it("accepte une URL CTA interne ou HTTPS", () => {
    for (const detailCtaUrl of [
      "/projets",
      "/projets/atlas-celeste",
      "https://example.com/project",
    ]) {
      const parsed = parseServiceWriteBody(
        valid({ detailCtaType: "custom", detailCtaUrl })
      );
      assert.equal(parsed.ok, true, detailCtaUrl);
    }
  });

  it("rejette une destination personnalisée vide ou dangereuse", () => {
    for (const detailCtaUrl of ["", "//evil.example", "javascript:alert(1)"]) {
      const parsed = parseServiceWriteBody(
        valid({ detailCtaType: "custom", detailCtaUrl })
      );
      assert.equal(parsed.ok, false, detailCtaUrl || "(vide)");
      if (!parsed.ok) {
        assert.equal(parsed.error, "service_invalid_detail_cta_url");
      }
    }
  });

  it("parse patch non vide", () => {
    const parsed = parseServicePatchBody({ featured: true });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.deepEqual(parsed.values, { featured: true });
    }
  });

  it("rejette patch vide", () => {
    assert.equal(parseServicePatchBody({}).ok, false);
  });

  it("parse reorder", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const parsed = parseServiceReorderBody({ orderedIds: [id] });
    assert.equal(parsed.ok, true);
  });

  it("slugify titre", () => {
    assert.equal(slugifyServiceTitle("Sites Professionnels"), "sites-professionnels");
  });
});

describe("services pricing", () => {
  it("convertit euros → cents", () => {
    assert.equal(parseEurosToCents("900"), 90000);
    assert.equal(parseEurosToCents("1 500,50"), 150050);
  });

  it("formate FR", () => {
    const formatted = formatServicePrice(150000, "EUR", "fr");
    assert.match(formatted, /1[\s\u202f]?500/);
    assert.match(formatted, /€/);
  });

  it("resolve starting_at", () => {
    const display = resolveServicePriceDisplay({
      pricingMode: "starting_at",
      startingPriceCents: 90000,
      currency: "EUR",
      locale: "fr",
      labels: {
        startingAt: (price) => `À partir de ${price}`,
        fixed: (price) => price,
        quoteOnly: "Sur devis",
        contact: "Parlons",
      },
    });
    assert.equal(display.mode, "starting_at");
    assert.match(display.label, /À partir de/);
  });

  it("resolve fixed", () => {
    const display = resolveServicePriceDisplay({
      pricingMode: "fixed",
      startingPriceCents: 250000,
      currency: "EUR",
      locale: "fr",
      labels: {
        startingAt: (price) => `À partir de ${price}`,
        fixed: (price) => price,
        quoteOnly: "Sur devis",
        contact: "Parlons",
      },
    });
    assert.equal(display.mode, "fixed");
    assert.match(display.formattedAmount, /€/);
  });

  it("resolve quote_only", () => {
    const display = resolveServicePriceDisplay({
      pricingMode: "quote_only",
      startingPriceCents: null,
      currency: "EUR",
      locale: "fr",
      labels: {
        startingAt: (price) => `À partir de ${price}`,
        fixed: (price) => price,
        quoteOnly: "Sur devis",
        contact: "Parlons",
      },
    });
    assert.equal(display.mode, "quote_only");
    assert.equal(display.label, "Sur devis");
  });
});

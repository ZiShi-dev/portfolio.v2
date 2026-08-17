import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveOfferInquiryProfile } from "@/data/project-inquiry-offer-profiles";

describe("project-inquiry offer profiles", () => {
  it("retourne null sans offre", () => {
    assert.equal(resolveOfferInquiryProfile(null), null);
    assert.equal(resolveOfferInquiryProfile(""), null);
  });

  it("adapte les objectifs selon l’offre catalogue", () => {
    const ecommerce = resolveOfferInquiryProfile("ecommerce");
    assert.ok(ecommerce);
    assert.equal(ecommerce.projectType, "ecommerce");
    assert.deepEqual(ecommerce.objectives, [
      "sell_online",
      "generate_leads",
      "modernize",
      "other",
    ]);

    const vitrine = resolveOfferInquiryProfile("vitrine");
    assert.ok(vitrine);
    assert.equal(vitrine.projectType, "showcase");
    assert.ok(!vitrine.objectives.includes("sell_online"));
  });

  it("utilise un profil générique pour une offre inconnue", () => {
    const generic = resolveOfferInquiryProfile("offre-custom", "saas");
    assert.ok(generic);
    assert.equal(generic.slug, "generic");
    assert.equal(generic.projectType, "saas");
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatLeadReference,
  parseLeadReferenceNumber,
  parseProjectInquiryAdminPatch,
  parseProjectInquiryPayload,
} from "@/lib/project-inquiry/schema";

const valid = {
  projectType: "web_app",
  projectTypeOther: null,
  objective: "create_product",
  objectiveOther: null,
  budgetRange: "1000_3000",
  budgetCustomAmount: null,
  timeline: "1_3_months",
  targetLaunchDate: null,
  description: "Je souhaite une application pour gérer mon activité.",
  name: "Alex Martin",
  email: "alex@example.com",
  phone: null,
  whatsapp: null,
  company: null,
  currentWebsite: null,
  locale: "fr",
  source: "site",
  serviceId: null,
  serviceReference: null,
};

describe("project-inquiry schema", () => {
  it("formate VZ—LEAD 001", () => {
    assert.equal(formatLeadReference(1), "VZ—LEAD 001");
    assert.equal(parseLeadReferenceNumber("VZ—LEAD 024"), 24);
  });

  it("accepte un payload valide", () => {
    const parsed = parseProjectInquiryPayload(valid);
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.data.budgetCustomAmount, null);
  });

  it("accepte 150 € et 350 €", () => {
    for (const budgetRange of ["amount_150", "amount_350"] as const) {
      const parsed = parseProjectInquiryPayload({ ...valid, budgetRange });
      assert.equal(parsed.ok, true);
    }
  });

  it("exige un texte pour type/objectif other", () => {
    const missingType = parseProjectInquiryPayload({
      ...valid,
      projectType: "other",
      projectTypeOther: null,
    });
    assert.equal(missingType.ok, false);

    const missingObjective = parseProjectInquiryPayload({
      ...valid,
      objective: "other",
      objectiveOther: " ",
    });
    assert.equal(missingObjective.ok, false);

    const ok = parseProjectInquiryPayload({
      ...valid,
      projectType: "other",
      projectTypeOther: "Outil interne RH",
      objective: "other",
      objectiveOther: "Automatiser les onboarding",
    });
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.data.projectTypeOther, "Outil interne RH");
      assert.equal(ok.data.objectiveOther, "Automatiser les onboarding");
    }
  });

  it("ignore les textes other hors mode other", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      projectTypeOther: "ne doit pas passer",
      objectiveOther: "ne doit pas passer",
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.data.projectTypeOther, null);
      assert.equal(parsed.data.objectiveOther, null);
    }
  });

  it("accepte une date sans timeline", () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const parsed = parseProjectInquiryPayload({
      ...valid,
      timeline: null,
      targetLaunchDate: futureDate,
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.data.targetLaunchDate, futureDate);
      assert.equal(parsed.data.timeline, "unknown");
    }
  });

  it("rejette une date impossible ou passée", () => {
    const invalid = parseProjectInquiryPayload({
      ...valid,
      timeline: null,
      targetLaunchDate: "2026-99-99",
    });
    assert.equal(invalid.ok, false);
    if (!invalid.ok) {
      assert.equal("field" in invalid ? invalid.field : undefined, "targetLaunchDate");
    }

    const past = parseProjectInquiryPayload({
      ...valid,
      timeline: null,
      targetLaunchDate: "2020-01-01",
    });
    assert.equal(past.ok, false);
    if (!past.ok) {
      assert.equal("field" in past ? past.field : undefined, "targetLaunchDate");
    }
  });

  it("rejette l’absence de timeline et de date", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      timeline: null,
      targetLaunchDate: null,
    });
    assert.equal(parsed.ok, false);
  });

  it("rejette un WhatsApp non numérique", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      whatsapp: "eeeeeeeeeeeee",
    });
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.equal(parsed.error, "invalidPhone");
      assert.equal("field" in parsed ? parsed.field : null, "whatsapp");
    }
  });

  it("exige un montant pour budget custom", () => {
    const missing = parseProjectInquiryPayload({
      ...valid,
      budgetRange: "custom",
      budgetCustomAmount: null,
    });
    assert.equal(missing.ok, false);

    const ok = parseProjectInquiryPayload({
      ...valid,
      budgetRange: "custom",
      budgetCustomAmount: 750,
    });
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.data.budgetCustomAmount, 750);
  });

  it("coerce le montant custom depuis une string", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      budgetRange: "custom",
      budgetCustomAmount: "1 200",
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.data.budgetCustomAmount, 1200);
  });

  it("ignore le montant custom hors mode custom", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      budgetRange: "amount_150",
      budgetCustomAmount: 999,
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.data.budgetCustomAmount, null);
  });

  it("rejette honeypot", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      _honeypot: "bot",
    });
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.error, "honeypot");
  });

  it("rejette email invalide", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      email: "not-an-email",
    });
    assert.equal(parsed.ok, false);
  });

  it("rejette les textes trop longs au lieu de les tronquer", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      description: "x".repeat(5001),
    });
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.equal("field" in parsed ? parsed.field : undefined, "description");
    }
  });

  it("rejette une source arbitraire", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      source: "forged-source",
    });
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.equal("field" in parsed ? parsed.field : undefined, "source");
    }
  });

  it("rejette type inconnu", () => {
    const parsed = parseProjectInquiryPayload({
      ...valid,
      projectType: "hack",
    });
    assert.equal(parsed.ok, false);
  });

  it("accepte patch admin statut", () => {
    const parsed = parseProjectInquiryAdminPatch({ status: "contacted" });
    assert.equal(parsed.ok, true);
  });

  it("rejette patch admin vide", () => {
    const parsed = parseProjectInquiryAdminPatch({});
    assert.equal(parsed.ok, false);
  });
});

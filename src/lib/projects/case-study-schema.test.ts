import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCaseReference,
  parseCaseReferenceNumber,
  parseProjectWriteBody,
} from "@/lib/projects/schema";

const baseWrite = {
  slug: "site-demo",
  title: { fr: "Titre FR", en: "Title EN", ar: "عنوان" },
  description: {
    fr: "Description française assez longue.",
    en: "Long enough English description.",
    ar: "وصف عربي كافٍ للتحقق.",
  },
  kind: "sold" as const,
  businessTypeIds: ["showcase"],
  images: [
    {
      url: "https://xyzcompany.supabase.co/storage/v1/object/public/portfolio-projects/a.jpg",
    },
  ],
  link: null,
  appLink: null,
  sortOrder: 0,
  published: false,
  featured: false,
  technologies: ["Next.js"],
  features: [{ fr: "Dashboard", en: "Dashboard", ar: "لوحة" }],
  clientNeed: { fr: "", en: "", ar: "" },
  objective: { fr: "", en: "", ar: "" },
  solution: { fr: "", en: "", ar: "" },
  result: { fr: "", en: "", ar: "" },
  seoTitle: { fr: "", en: "", ar: "" },
  seoDescription: { fr: "", en: "", ar: "" },
};

describe("projects case study schema", () => {
  it("formate VZ—CASE 001", () => {
    assert.equal(formatCaseReference(1), "VZ—CASE 001");
    assert.equal(formatCaseReference(12), "VZ—CASE 012");
    assert.equal(parseCaseReferenceNumber("VZ—CASE 012"), 12);
    assert.equal(parseCaseReferenceNumber("VZ-CASE 3"), 3);
  });

  it("autorise un brouillon sans récit", () => {
    const parsed = parseProjectWriteBody(baseWrite);
    assert.equal(parsed.ok, true);
  });

  it("refuse une publication sans images", () => {
    const parsed = parseProjectWriteBody({
      ...baseWrite,
      published: true,
      images: [],
    });
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.equal(parsed.error, "publish_requires_images");
    }
  });

  it("accepte une publication complète", () => {
    const parsed = parseProjectWriteBody({
      ...baseWrite,
      published: true,
      clientNeed: {
        fr: "Besoin client clair pour le site.",
        en: "",
        ar: "",
      },
    });
    assert.equal(parsed.ok, true);
  });
});

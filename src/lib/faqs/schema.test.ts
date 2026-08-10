import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseFaqPatchBody,
  parseFaqReorderBody,
  parseFaqWriteBody,
} from "@/lib/faqs/schema";

function valid(overrides: Record<string, unknown> = {}) {
  return {
    reference: "VZ—Q09",
    status: "draft",
    featured: false,
    sortOrder: 90,
    scope: "general",
    question: {
      fr: "Question test ?",
      en: "Test question?",
      ar: "سؤال؟",
    },
    answer: {
      fr: "Réponse FR",
      en: "EN answer",
      ar: "إجابة",
    },
    serviceIds: [],
    ...overrides,
  };
}

describe("faqs schema", () => {
  it("accepte un brouillon minimal", () => {
    const parsed = parseFaqWriteBody(valid());
    assert.equal(parsed.ok, true);
  });

  it("accepte un brouillon sans question FR", () => {
    const parsed = parseFaqWriteBody(
      valid({
        question: { fr: "", en: "x", ar: "y" },
        answer: { fr: "", en: "x", ar: "y" },
      })
    );
    assert.equal(parsed.ok, true);
  });

  it("exige question FR pour publier", () => {
    const parsed = parseFaqWriteBody(
      valid({
        status: "published",
        question: { fr: "", en: "x", ar: "y" },
      })
    );
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.error, "publish_requires_question");
  });

  it("exige réponse FR pour publier", () => {
    const parsed = parseFaqWriteBody(
      valid({
        status: "published",
        answer: { fr: "", en: "x", ar: "y" },
      })
    );
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.error, "publish_requires_answer");
  });

  it("parse patch non vide", () => {
    const parsed = parseFaqPatchBody({ status: "archived" });
    assert.equal(parsed.ok, true);
  });

  it("rejette patch vide", () => {
    const parsed = parseFaqPatchBody({});
    assert.equal(parsed.ok, false);
  });

  it("parse reorder", () => {
    const parsed = parseFaqReorderBody({
      orderedIds: [
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222",
      ],
    });
    assert.equal(parsed.ok, true);
  });

  it("rejette serviceIds en double", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const parsed = parseFaqWriteBody(valid({ serviceIds: [id, id] }));
    assert.equal(parsed.ok, false);
  });
});

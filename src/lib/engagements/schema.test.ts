import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseEngagementPatchBody,
  parseEngagementReorderBody,
  parseEngagementWriteBody,
} from "@/lib/engagements/schema";

function valid(overrides: Record<string, unknown> = {}) {
  return {
    reference: "VZ—C05",
    icon: "file-check",
    status: "draft",
    sortOrder: 50,
    title: { fr: "Titre test", en: "Test title", ar: "عنوان" },
    description: {
      fr: "Description FR",
      en: "EN description",
      ar: "وصف",
    },
    ...overrides,
  };
}

describe("engagements schema", () => {
  it("accepte un brouillon minimal", () => {
    const parsed = parseEngagementWriteBody(valid());
    assert.equal(parsed.ok, true);
  });

  it("exige titre FR pour publier", () => {
    const parsed = parseEngagementWriteBody(
      valid({
        status: "published",
        title: { fr: "", en: "x", ar: "y" },
      })
    );
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.error, "publish_requires_title");
  });

  it("exige description FR pour publier", () => {
    const parsed = parseEngagementWriteBody(
      valid({
        status: "published",
        description: { fr: "", en: "x", ar: "y" },
      })
    );
    assert.equal(parsed.ok, false);
    if (!parsed.ok) assert.equal(parsed.error, "publish_requires_description");
  });

  it("rejette icône invalide", () => {
    const parsed = parseEngagementWriteBody(valid({ icon: "FileCheck" }));
    assert.equal(parsed.ok, false);
  });

  it("parse patch non vide", () => {
    const parsed = parseEngagementPatchBody({ status: "archived" });
    assert.equal(parsed.ok, true);
  });

  it("rejette patch vide", () => {
    const parsed = parseEngagementPatchBody({});
    assert.equal(parsed.ok, false);
  });

  it("parse reorder", () => {
    const parsed = parseEngagementReorderBody({
      orderedIds: [
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222",
      ],
    });
    assert.equal(parsed.ok, true);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { routing } from "@/i18n/routing";

describe("routing i18n — URLs localisées", () => {
  it("garde le français à la racine et préfixe les autres langues", () => {
    assert.equal(routing.localePrefix, "as-needed");
  });

  it("locales autorisées fr, en, ar", () => {
    assert.deepEqual([...routing.locales], ["fr", "en", "ar"]);
    assert.equal(routing.defaultLocale, "fr");
  });
});

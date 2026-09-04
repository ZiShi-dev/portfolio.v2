import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLocaleSwitchHref } from "@/lib/locale-navigation";

describe("getLocaleSwitchHref", () => {
  it("garde le français sans préfixe à la racine", () => {
    assert.equal(getLocaleSwitchHref("/", "fr"), "/");
  });

  it("préfixe les autres langues", () => {
    assert.equal(getLocaleSwitchHref("/", "en"), "/en");
    assert.equal(getLocaleSwitchHref("/", "ar"), "/ar");
  });

  it("conserve le chemin sans préfixe pour le français", () => {
    assert.equal(getLocaleSwitchHref("/offres", "fr"), "/offres");
    assert.equal(getLocaleSwitchHref("/offres/site-vitrine", "fr"), "/offres/site-vitrine");
  });

  it("préfixe les sous-pages pour en et ar", () => {
    assert.equal(getLocaleSwitchHref("/offres", "en"), "/en/offres");
    assert.equal(getLocaleSwitchHref("/offres", "ar"), "/ar/offres");
  });

  it("conserve query et hash", () => {
    assert.equal(
      getLocaleSwitchHref("/offres", "fr", { search: "?x=1", hash: "#faq" }),
      "/offres?x=1#faq"
    );
    assert.equal(
      getLocaleSwitchHref("/offres", "en", { search: "?x=1", hash: "#faq" }),
      "/en/offres?x=1#faq"
    );
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redirectLegacyLocalePrefix } from "@/lib/i18n/legacy-locale-redirect";
import { NEXT_LOCALE_COOKIE } from "@/lib/locale-cookie";

describe("redirectLegacyLocalePrefix — français canonique sans /fr", () => {
  it("ignore les chemins sans préfixe locale", () => {
    const res = redirectLegacyLocalePrefix(
      new Request("http://localhost:3000/projets")
    );
    assert.equal(res, null);
  });

  it("conserve /ar comme URL indexable", () => {
    const res = redirectLegacyLocalePrefix(new Request("http://localhost:3000/ar"));
    assert.equal(res, null);
  });

  it("conserve /en/projets comme URL indexable", () => {
    const res = redirectLegacyLocalePrefix(
      new Request("http://localhost:3000/en/projets?x=1")
    );
    assert.equal(res, null);
  });

  it("redirige /fr/contact vers /contact", () => {
    const res = redirectLegacyLocalePrefix(
      new Request("http://localhost:3000/fr/contact")
    );
    assert.ok(res);
    assert.equal(res!.status, 308);
    assert.match(res!.headers.get("location") ?? "", /\/contact$/);
    const cookie = res!.headers.get("set-cookie") ?? "";
    assert.match(cookie, new RegExp(`${NEXT_LOCALE_COOKIE}=fr`));
  });

  it("ne confond pas admin avec une locale", () => {
    const res = redirectLegacyLocalePrefix(
      new Request("http://localhost:3000/admin")
    );
    assert.equal(res, null);
  });
});

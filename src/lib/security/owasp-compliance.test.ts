/**
 * Vérification de la matrice OWASP — chaque contrôle listé doit rester couvert par les suites de tests.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OWASP_CONTROLS } from "@/lib/security/owasp-checklist";

describe("OWASP Top 10 — matrice de conformité documentée", () => {
  it("couvre les 9 catégories applicables au projet", () => {
    const ids = OWASP_CONTROLS.map((entry) => entry.id);
    assert.deepEqual(ids, [
      "A01",
      "A02",
      "A03",
      "A04",
      "A05",
      "A07",
      "A08",
      "A09",
      "A10",
    ]);
  });

  it("chaque catégorie a au moins 2 contrôles techniques", () => {
    for (const entry of OWASP_CONTROLS) {
      assert.ok(
        entry.controls.length >= 2,
        `${entry.id} doit documenter plusieurs contrôles`
      );
      for (const control of entry.controls) {
        assert.ok(control.trim().length > 8, `${entry.id}: contrôle trop court`);
      }
    }
  });
});

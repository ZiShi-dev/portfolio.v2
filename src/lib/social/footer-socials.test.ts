import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFooterSocials } from "@/lib/brand";
import { getConfiguredSocialLinks } from "@/lib/social/public-links";

const emptySocial = {
  discord: "",
  whatsapp: "",
  instagram: "",
  tiktok: "",
  facebook: "",
};

describe("buildFooterSocials", () => {
  it("marque le premier réseau renseigné comme preferred", () => {
    const links = buildFooterSocials({
      ...emptySocial,
      discord: "https://discord.gg/x",
    });
    const discord = links.find((l) => l.id === "discord");
    assert.equal(discord?.preferred, true);
    assert.equal(discord?.href, "https://discord.gg/x");
  });

  it("privilégie WhatsApp par défaut", () => {
    const links = buildFooterSocials({
      ...emptySocial,
      discord: "https://discord.gg/x",
      whatsapp: "https://wa.me/33",
    });
    assert.equal(links[0]?.id, "whatsapp");
    assert.equal(links[0]?.preferred, true);
    assert.equal(links.find((l) => l.id === "discord")?.preferred, undefined);
  });

  it("suit la priorité réglée en admin", () => {
    const links = buildFooterSocials(
      {
        ...emptySocial,
        discord: "https://discord.gg/x",
        whatsapp: "https://wa.me/33",
        instagram: "https://www.instagram.com/x",
      },
      ["instagram", "discord"]
    );
    assert.deepEqual(
      links.map((l) => l.id),
      ["instagram", "discord", "whatsapp", "tiktok", "facebook"]
    );
    assert.equal(links[0]?.preferred, true);
  });

  it("ignore une priorité invalide", () => {
    const links = buildFooterSocials(
      {
        ...emptySocial,
        whatsapp: "https://wa.me/33",
      },
      ["email", "nope"] as never
    );
    assert.equal(links.length, 5);
    assert.equal(links[0]?.id, "whatsapp");
  });

  it("conserve les href vides (masqués côté UI)", () => {
    const links = buildFooterSocials(emptySocial);
    assert.equal(links.length, 5);
    assert.ok(links.every((l) => l.href === ""));
    assert.ok(links.every((l) => l.preferred === undefined));
  });
});

describe("getConfiguredSocialLinks", () => {
  it("masque les réseaux vides sans modifier l'ordre de priorité", () => {
    const links = buildFooterSocials(
      {
        ...emptySocial,
        discord: "https://discord.gg/x",
        instagram: "https://www.instagram.com/x",
      },
      ["instagram", "whatsapp", "discord", "tiktok", "facebook"]
    );

    assert.deepEqual(
      getConfiguredSocialLinks(links).map((link) => link.id),
      ["instagram", "discord"]
    );
  });

  it("retourne une liste vide quand aucun réseau n'est configuré", () => {
    const links = buildFooterSocials(emptySocial);

    assert.deepEqual(getConfiguredSocialLinks(links), []);
  });
});

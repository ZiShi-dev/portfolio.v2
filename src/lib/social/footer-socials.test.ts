import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFooterSocials } from "@/lib/brand";

describe("buildFooterSocials", () => {
  it("marque le premier réseau renseigné comme preferred", () => {
    const links = buildFooterSocials({
      discord: "https://discord.gg/x",
      whatsapp: "",
      instagram: "",
      tiktok: "",
    });
    const discord = links.find((l) => l.id === "discord");
    assert.equal(discord?.preferred, true);
    assert.equal(discord?.href, "https://discord.gg/x");
  });

  it("privilégie WhatsApp par défaut", () => {
    const links = buildFooterSocials({
      discord: "https://discord.gg/x",
      whatsapp: "https://wa.me/33",
      instagram: "",
      tiktok: "",
    });
    assert.equal(links[0]?.id, "whatsapp");
    assert.equal(links[0]?.preferred, true);
    assert.equal(links.find((l) => l.id === "discord")?.preferred, undefined);
  });

  it("suit la priorité réglée en admin", () => {
    const links = buildFooterSocials(
      {
        discord: "https://discord.gg/x",
        whatsapp: "https://wa.me/33",
        instagram: "https://www.instagram.com/x",
        tiktok: "",
      },
      ["instagram", "discord"]
    );
    assert.deepEqual(
      links.map((l) => l.id),
      ["instagram", "discord", "whatsapp", "tiktok"]
    );
    assert.equal(links[0]?.preferred, true);
  });

  it("ignore une priorité invalide", () => {
    const links = buildFooterSocials(
      {
        discord: "",
        whatsapp: "https://wa.me/33",
        instagram: "",
        tiktok: "",
      },
      ["email", "nope"] as never
    );
    assert.equal(links.length, 4);
    assert.equal(links[0]?.id, "whatsapp");
  });

  it("conserve les href vides (masqués côté UI)", () => {
    const links = buildFooterSocials({
      discord: "",
      whatsapp: "",
      instagram: "",
      tiktok: "",
    });
    assert.equal(links.length, 4);
    assert.ok(links.every((l) => l.href === ""));
    assert.ok(links.every((l) => l.preferred === undefined));
  });
});

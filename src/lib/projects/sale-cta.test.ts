import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeSaleCtaChannels,
  resolveSaleCtaButtons,
} from "@/lib/projects/sale-cta";
import { buildFooterSocials } from "@/lib/brand";

/** Réseaux triés par la priorité par défaut : WhatsApp d’abord. */
const socials = buildFooterSocials({
  discord: "https://discord.gg/x",
  whatsapp: "https://wa.me/33",
  instagram: "",
  tiktok: "",
});

describe("sale-cta", () => {
  it("normalise, déduplique et ignore l’email", () => {
    assert.deepEqual(
      normalizeSaleCtaChannels(["whatsapp", "email", "whatsapp", "nope", "discord"]),
      ["whatsapp", "discord"]
    );
  });

  it("affiche les canaux cochés dans l’ordre de priorité", () => {
    const buttons = resolveSaleCtaButtons({
      channels: ["discord", "whatsapp"],
      socials,
    });
    assert.equal(buttons.length, 2);
    assert.equal(buttons[0]?.id, "whatsapp");
    assert.equal(buttons[0]?.primary, true);
    assert.equal(buttons[0]?.label, "WhatsApp");
    assert.equal(buttons[1]?.label, "Discord");
    assert.equal(buttons[1]?.primary, false);
  });

  it("suit la priorité réglée en admin pour le CTA principal", () => {
    const discordFirst = buildFooterSocials(
      {
        discord: "https://discord.gg/x",
        whatsapp: "https://wa.me/33",
        instagram: "",
        tiktok: "",
      },
      ["discord", "whatsapp", "instagram", "tiktok"]
    );
    const buttons = resolveSaleCtaButtons({
      channels: ["whatsapp", "discord"],
      socials: discordFirst,
    });
    assert.equal(buttons[0]?.id, "discord");
    assert.equal(buttons[0]?.primary, true);
  });

  it("n’affiche rien si aucun canal n’est choisi", () => {
    const buttons = resolveSaleCtaButtons({ channels: [], socials });
    assert.equal(buttons.length, 0);
  });

  it("ignore les réseaux sans URL", () => {
    const buttons = resolveSaleCtaButtons({
      channels: ["instagram", "discord"],
      socials,
    });
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0]?.id, "discord");
    assert.equal(buttons[0]?.href, "https://discord.gg/x");
  });

  it("jamais de lien mailto / Gmail sur une fiche à vendre", () => {
    const buttons = resolveSaleCtaButtons({
      channels: ["whatsapp", "discord"],
      socials,
    });
    assert.ok(buttons.every((b) => b.href.startsWith("https://")));
    assert.ok(buttons.every((b) => !b.href.includes("mail")));
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeSaleCtaChannels,
  resolveSaleCtaButtons,
} from "@/lib/projects/sale-cta";

const socials = [
  { id: "discord" as const, label: "Discord", href: "https://discord.gg/x", preferred: true },
  { id: "whatsapp" as const, label: "WhatsApp", href: "https://wa.me/33" },
  { id: "instagram" as const, label: "Instagram", href: "" },
  { id: "tiktok" as const, label: "TikTok", href: "" },
];

describe("sale-cta", () => {
  it("normalise et déduplique les canaux", () => {
    assert.deepEqual(normalizeSaleCtaChannels(["whatsapp", "email", "whatsapp", "nope"]), [
      "whatsapp",
      "email",
    ]);
  });

  it("affiche tous les canaux cochés avec leur nom", () => {
    const buttons = resolveSaleCtaButtons({
      channels: ["whatsapp", "discord"],
      email: "hello@zishi.dev",
      socials,
      emailLabel: "Email",
    });
    assert.equal(buttons.length, 2);
    assert.equal(buttons[0]?.id, "whatsapp");
    assert.equal(buttons[0]?.primary, true);
    assert.equal(buttons[0]?.label, "WhatsApp");
    assert.equal(buttons[1]?.label, "Discord");
    assert.equal(buttons[1]?.primary, false);
  });

  it("n’affiche rien si aucun canal n’est choisi", () => {
    const buttons = resolveSaleCtaButtons({
      channels: [],
      email: "hello@zishi.dev",
      socials,
      emailLabel: "Email",
    });
    assert.equal(buttons.length, 0);
  });

  it("ignore les canaux sans URL", () => {
    const buttons = resolveSaleCtaButtons({
      channels: ["instagram", "email"],
      email: "hello@zishi.dev",
      socials,
      emailLabel: "Email",
    });
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0]?.id, "email");
    assert.equal(
      buttons[0]?.href,
      "https://mail.google.com/mail/?view=cm&fs=1&to=hello%40zishi.dev"
    );
    assert.equal(buttons[0]?.label, "Email");
  });
});

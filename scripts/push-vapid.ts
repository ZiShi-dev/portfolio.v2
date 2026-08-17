import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

process.stdout.write(
  [
    "# Copiez ces valeurs dans .env.local (jamais dans git).",
    `VAPID_PUBLIC_KEY=${keys.publicKey}`,
    `VAPID_PRIVATE_KEY=${keys.privateKey}`,
    "VAPID_SUBJECT=mailto:contact@example.com",
    "",
  ].join("\n")
);

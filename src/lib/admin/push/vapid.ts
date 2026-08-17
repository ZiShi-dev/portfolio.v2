function readEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function getVapidPublicKey(): string {
  return readEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY") || readEnv("VAPID_PUBLIC_KEY");
}

export function getVapidPrivateKey(): string {
  return readEnv("VAPID_PRIVATE_KEY");
}

export function getVapidSubject(): string {
  const subject = readEnv("VAPID_SUBJECT");
  if (subject) return subject;
  const site = readEnv("NEXT_PUBLIC_SITE_URL");
  if (site) return site;
  return "mailto:admin@localhost";
}

export function isWebPushConfigured(): boolean {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}
